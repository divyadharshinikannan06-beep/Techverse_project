const { randomUUID } = require('crypto')

function ensureStore() {
  if (!globalThis.__techverse_memory_store) {
    globalThis.__techverse_memory_store = {}
  }
  return globalThis.__techverse_memory_store
}

function clone(value) {
  if (value === null || value === undefined) return value
  return JSON.parse(JSON.stringify(value))
}

function getCollection(modelName) {
  const store = ensureStore()
  if (!store[modelName]) {
    store[modelName] = []
  }
  return store[modelName]
}

function safeEq(left, right) {
  if (left instanceof Date || right instanceof Date) {
    return new Date(left).getTime() === new Date(right).getTime()
  }
  return JSON.stringify(left) === JSON.stringify(right)
}

function getNestedValue(source, path) {
  if (!path || path === '_id') return source ? source._id : undefined
  return path.split('.').reduce((current, segment) => {
    if (current == null) return undefined
    if (Array.isArray(current)) {
      if (segment === '$') return current
      return current.map((item) => (item && typeof item === 'object' ? item[segment] : undefined))
    }
    return current[segment]
  }, source)
}

function setNestedValue(source, path, value) {
  if (!path) return value
  const segments = path.split('.')
  let cursor = source
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    if (cursor[segment] === undefined || cursor[segment] === null || typeof cursor[segment] !== 'object') {
      cursor[segment] = {}
    }
    cursor = cursor[segment]
  }
  cursor[segments[segments.length - 1]] = value
  return source
}

function matchesQuery(documentValue, query = {}) {
  return Object.entries(query).every(([path, expected]) => {
    if (path === '_id') {
      return String(documentValue._id) === String(expected)
    }

    if (path.includes('.')) {
      const segments = path.split('.')
      const finalSegment = segments[segments.length - 1]
      const parentPath = segments.slice(0, -1).join('.')
      const parentValue = getNestedValue(documentValue, parentPath)

      if (Array.isArray(parentValue)) {
        if (expected && typeof expected === 'object' && !Array.isArray(expected) && '$ne' in expected) {
          return !parentValue.some((entry) => entry && typeof entry === 'object' && safeEq(entry[finalSegment], expected.$ne))
        }
        if (expected && typeof expected === 'object' && !Array.isArray(expected) && '$in' in expected) {
          return parentValue.some((entry) => entry && typeof entry === 'object' && expected.$in.some((item) => safeEq(entry[finalSegment], item)))
        }
        return parentValue.some((entry) => entry && typeof entry === 'object' && safeEq(entry[finalSegment], expected))
      }
    }

    const actualValue = getNestedValue(documentValue, path)

    if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
      if ('$ne' in expected) {
        return !safeEq(actualValue, expected.$ne)
      }
      if ('$in' in expected) {
        return expected.$in.some((entry) => safeEq(actualValue, entry))
      }
      if ('$gt' in expected) {
        return Number(actualValue) > Number(expected.$gt)
      }
      if ('$lt' in expected) {
        return Number(actualValue) < Number(expected.$lt)
      }
      if ('$exists' in expected) {
        const valueExists = actualValue !== undefined && actualValue !== null
        return valueExists === expected.$exists
      }
      if ('$eq' in expected) {
        return safeEq(actualValue, expected.$eq)
      }
    }

    return safeEq(actualValue, expected)
  })
}

function applyUpdate(documentValue, update = {}, query = {}) {
  const nextDocument = clone(documentValue)

  Object.entries(update).forEach(([operation, values]) => {
    if (!values || typeof values !== 'object') return

    if (operation === '$setOnInsert') {
      Object.entries(values).forEach(([path, value]) => {
        if (getNestedValue(nextDocument, path) === undefined) {
          setNestedValue(nextDocument, path, value)
        }
      })
      return
    }

    if (operation === '$set') {
      Object.entries(values).forEach(([path, value]) => {
        setNestedValue(nextDocument, path, value)
      })
      return
    }

    if (operation === '$inc') {
      Object.entries(values).forEach(([path, amount]) => {
        if (path.includes('.$.')) {
          const [arrayPath, fieldPath] = path.split('.$.')
          const sourceArray = getNestedValue(nextDocument, arrayPath) || []
          const candidate = sourceArray.find((entry) => {
            if (!entry || typeof entry !== 'object') return false
            const matchField = Object.entries(query).find(([queryPath]) => queryPath.startsWith(`${arrayPath}.`))
            if (!matchField) return false
            return safeEq(entry[matchField[0].split('.').at(-1)], matchField[1])
          }) || sourceArray[0]
          if (candidate && fieldPath) {
            candidate[fieldPath] = Number(candidate[fieldPath] || 0) + Number(amount)
            return
          }
        }

        const currentValue = Number(getNestedValue(nextDocument, path) || 0)
        setNestedValue(nextDocument, path, currentValue + Number(amount))
      })
      return
    }

    if (operation === '$push') {
      Object.entries(values).forEach(([path, item]) => {
        const arrayValue = getNestedValue(nextDocument, path) || []
        arrayValue.push(item)
        setNestedValue(nextDocument, path, arrayValue)
      })
      return
    }

    if (operation === '$pull') {
      Object.entries(values).forEach(([path, matcher]) => {
        const arrayValue = getNestedValue(nextDocument, path) || []
        const filtered = arrayValue.filter((entry) => !matchesQuery(entry, matcher))
        setNestedValue(nextDocument, path, filtered)
      })
    }
  })

  return nextDocument
}

function decorateDocument(documentValue, modelName, options = {}) {
  if (!documentValue || typeof documentValue !== 'object') return documentValue

  const doc = clone(documentValue)
  if (options.decorate) {
    options.decorate(doc)
  }
  if (modelName === 'User' && !doc.matchPassword) {
    doc.matchPassword = async function matchPassword(enteredPassword) {
      const bcrypt = require('bcryptjs')
      return bcrypt.compare(enteredPassword, this.password)
    }
  }

  return doc
}

function wrapQueryResult(documentValue, modelName, options = {}) {
  let current = documentValue == null ? null : decorateDocument(documentValue, modelName, options)

  const wrapper = {
    then: (resolve, reject) => Promise.resolve(current).then(resolve, reject),
    lean: () => clone(current),
    select: (projection) => {
      if (projection && typeof projection === 'string' && projection.startsWith('-')) {
        const field = projection.replace('-', '').trim()
        if (current && typeof current === 'object') {
          delete current[field]
        }
      }
      return wrapper
    },
    sort: (sortFields = {}) => {
      if (current && Array.isArray(current)) {
        const entries = [...current]
        const keys = Object.keys(sortFields)
        entries.sort((left, right) => {
          for (const key of keys) {
            const direction = sortFields[key] === -1 ? -1 : 1
            const leftValue = getNestedValue(left, key)
            const rightValue = getNestedValue(right, key)
            if (leftValue === rightValue) continue
            return (leftValue > rightValue ? 1 : -1) * direction
          }
          return 0
        })
        current = entries
      }
      return wrapper
    },
  }

  if (current && typeof current === 'object') {
    Object.assign(wrapper, current)
  }

  return wrapper
}

function applyInMemoryModel(modelName, schema, options = {}) {
  const collection = getCollection(modelName)

  const decorate = (doc) => {
    if (!doc || typeof doc !== 'object') return doc
    if (options.decorate) options.decorate(doc)
    if (modelName === 'User' && !doc.matchPassword) {
      doc.matchPassword = async function matchPassword(enteredPassword) {
        const bcrypt = require('bcryptjs')
        return bcrypt.compare(enteredPassword, this.password)
      }
    }
    return doc
  }

  const model = {
    modelName,
    schema,
    async create(documentData = {}) {
      const created = clone(documentData)
      created._id = created._id || randomUUID()
      created.createdAt = created.createdAt || new Date()
      created.updatedAt = created.updatedAt || new Date()
      if (options.beforeCreate) {
        await options.beforeCreate(created)
      }
      collection.push(created)
      return decorate(created)
    },
    findOne(query = {}) {
      const match = collection.find((entry) => matchesQuery(entry, query)) || null
      return wrapQueryResult(match, modelName, { decorate })
    },
    findById(id) {
      const match = collection.find((entry) => String(entry._id) === String(id)) || null
      return wrapQueryResult(match, modelName, { decorate })
    },
    findByIdAndUpdate(id, update, optionsForUpdate = {}) {
      const index = collection.findIndex((entry) => String(entry._id) === String(id))
      if (index === -1 && optionsForUpdate.upsert) {
        const created = applyUpdate({ _id: id }, update, { _id: id })
        collection.push(created)
        return wrapQueryResult(created, modelName, { decorate })
      }
      if (index === -1) return wrapQueryResult(null, modelName, { decorate })
      const updated = applyUpdate(collection[index], update, { _id: id })
      collection[index] = updated
      return wrapQueryResult(updated, modelName, { decorate })
    },
    findOneAndUpdate(query = {}, update = {}, optionsForUpdate = {}) {
      const matchIndex = collection.findIndex((entry) => matchesQuery(entry, query))
      if (matchIndex === -1) {
        if (!optionsForUpdate.upsert) return wrapQueryResult(null, modelName, { decorate })
        const seeded = { _id: randomUUID(), ...query }
        const created = applyUpdate(seeded, { $setOnInsert: query, ...update }, query)
        collection.push(created)
        return wrapQueryResult(created, modelName, { decorate })
      }
      const updated = applyUpdate(collection[matchIndex], update, query)
      collection[matchIndex] = updated
      return wrapQueryResult(updated, modelName, { decorate })
    },
    updateOne(query = {}, update = {}) {
      const matchIndex = collection.findIndex((entry) => matchesQuery(entry, query))
      if (matchIndex === -1) return { acknowledged: true, modifiedCount: 0, matchedCount: 0 }
      const updated = applyUpdate(collection[matchIndex], update, query)
      collection[matchIndex] = updated
      return { acknowledged: true, modifiedCount: 1, matchedCount: 1 }
    },
    find(query = {}) {
      const filtered = collection.filter((entry) => matchesQuery(entry, query))
      return {
        lean: () => filtered.map((entry) => decorate(clone(entry))),
        sort: (sortFields = {}) => {
          const sorted = [...filtered]
          Object.keys(sortFields).forEach((key) => {
            const direction = sortFields[key] === -1 ? -1 : 1
            sorted.sort((left, right) => {
              const leftValue = getNestedValue(left, key)
              const rightValue = getNestedValue(right, key)
              if (leftValue === rightValue) return 0
              return (leftValue > rightValue ? 1 : -1) * direction
            })
          })
          return { lean: () => sorted.map((entry) => decorate(clone(entry))) }
        },
      }
    },
    findByIdAndDelete(id) {
      const index = collection.findIndex((entry) => String(entry._id) === String(id))
      if (index === -1) return wrapQueryResult(null, modelName, { decorate })
      const [deleted] = collection.splice(index, 1)
      return wrapQueryResult(deleted, modelName, { decorate })
    },
    countDocuments(query = {}) {
      return collection.filter((entry) => matchesQuery(entry, query)).length
    },
  }

  return model
}

module.exports = {
  ensureStore,
  getCollection,
  matchesQuery,
  applyUpdate,
  wrapQueryResult,
  applyInMemoryModel,
}
