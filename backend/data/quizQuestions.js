const answerKeyByModule = {
  'cloud-fundamentals': [
    [1, 'Cloud computing provides on-demand resources through a network and provider-managed infrastructure.'],
    [2, 'IaaS gives customers virtualized infrastructure, including control over the guest operating system.'],
    [0, 'Customers remain responsible for their own account access and configuration under the shared-responsibility model.'],
    [3, 'A hybrid cloud connects private infrastructure with public cloud services.'],
    [1, 'Elastic capacity helps match resource usage to changing demand.'],
  ],
  'cloud-virtual-machines': [
    [2, 'A hypervisor enables isolated virtual machines to share a physical host.'],
    [0, 'An image is a repeatable starting point for a virtual machine.'],
    [3, 'Monitoring usage helps teams right-size compute resources.'],
    [1, 'Virtual CPU and memory are allocated to an instance.'],
    [2, 'Isolation separates workloads and their runtime contexts on shared hardware.'],
  ],
  'cloud-networking': [
    [1, 'Subnets divide a virtual network address space into smaller segments.'],
    [3, 'Route tables determine how network packets are directed.'],
    [0, 'Least privilege permits only the traffic required for the service.'],
    [2, 'Private subnets reduce direct public exposure of internal services.'],
    [1, 'Network rules commonly constrain traffic by source, protocol, and port.'],
  ],
  'cloud-containers': [
    [3, 'A container image is an immutable template from which container instances run.'],
    [0, 'Readiness checks prevent traffic from reaching instances before they can serve requests.'],
    [2, 'Runtime secret mechanisms keep credentials out of public images and source control.'],
    [1, 'A sustained error increase after rollout is a useful signal to investigate or roll back.'],
    [3, 'Rolling deployments replace instances gradually while health is monitored.'],
  ],
  'web-fundamentals': [
    [0, 'HTML provides semantic document structure.'],
    [2, 'A button is the semantic interactive control for an action.'],
    [1, 'CSS controls layout and presentation.'],
    [3, 'Browsers parse HTML and request referenced resources such as stylesheets and scripts.'],
    [0, 'Semantic HTML communicates purpose to browsers, assistive technology, and maintainers.'],
  ],
  'web-javascript': [
    [2, 'Const prevents reassignment of the binding and is a good default for unchanged references.'],
    [0, 'A parameter receives a value supplied when a function is called.'],
    [3, 'The click event is commonly used to respond to button activation.'],
    [1, 'Boundary validation catches invalid or unexpected input before it reaches domain operations.'],
    [2, 'JSON.stringify serializes a JavaScript value to JSON text; it does not encrypt or persist it.'],
  ],
  'web-react': [
    [0, 'Props pass data from a parent component to a child.'],
    [3, 'State represents changing values that affect rendered UI.'],
    [1, 'Stable keys let React track item identity when a list changes.'],
    [2, 'Focused components are easier to reuse, test, and maintain.'],
    [0, 'Shared sibling state generally belongs in an appropriate common owner.'],
  ],
  'web-architecture': [
    [3, 'Authorization is a security decision and must be enforced by the server.'],
    [1, 'A clear API contract defines the request and response for a focused operation.'],
    [0, 'The server must derive rewards from trusted data rather than trusting client values.'],
    [2, 'Caching decisions must account for freshness and privacy requirements.'],
    [1, 'Robust clients communicate failures and provide safe recovery behavior.'],
  ],
  'ai-fundamentals': [
    [0, 'Supervised learning uses examples that include labels.'],
    [2, 'A model produces outputs from inputs according to learned parameters.'],
    [3, 'Review helps detect uncertainty, bias, and mistakes in consequential decisions.'],
    [1, 'Rule-based systems follow explicitly authored logic.'],
    [0, 'Data quality and task fit both affect model reliability.'],
  ],
  'ai-python': [
    [0, 'Inspection reveals data quality issues and helps identify the meaning of variables.'],
    [2, 'A separate validation set estimates performance on examples not used to fit the model.'],
    [1, 'Leakage occurs when training uses information unavailable at prediction time.'],
    [3, 'Recording data versions, settings, and metrics makes experiments repeatable.'],
    [0, 'Missing values need a deliberate strategy based on their meaning and context.'],
  ],
  'ai-machine-learning': [
    [2, 'A label is the target output associated with a supervised learning example.'],
    [0, 'Overfitting means a model fails to generalize well beyond its training examples.'],
    [3, 'A baseline provides a simple performance comparison for more complex models.'],
    [1, 'Metrics should reflect the task and the relative cost of different errors.'],
    [0, 'Held-out data helps estimate how the model may perform on unseen examples.'],
  ],
  'ai-neural-networks': [
    [2, 'Layers transform learned representations as information passes through the network.'],
    [0, 'Activations introduce non-linearity so stacked layers can represent complex relationships.'],
    [3, 'A loss function measures error between model outputs and task targets.'],
    [1, 'Gradient-based optimization updates model parameters to reduce the loss.'],
    [0, 'More complexity can exceed available data or fail to improve generalization.'],
  ],
  'cyber-fundamentals': [
    [0, 'Confidentiality concerns preventing unauthorized information disclosure.'],
    [2, 'A vulnerability is a weakness that a threat may exploit.'],
    [3, 'Defense in depth uses complementary controls rather than relying on one defense.'],
    [1, 'Availability concerns keeping systems and information usable when needed.'],
    [0, 'Audit logs support monitoring, investigation, and accountability.'],
  ],
  'cyber-authentication': [
    [2, 'Authentication verifies who is presenting credentials.'],
    [0, 'Authorization determines whether an identity may perform a requested action.'],
    [3, 'MFA uses independent factor types to strengthen identity verification.'],
    [1, 'Least privilege grants only the permissions required for a task.'],
    [2, 'Sensitive permissions must be checked by the server, not only by the interface.'],
  ],
  'cyber-web-security': [
    [0, 'Parameterized operations keep untrusted values separate from query structure.'],
    [3, 'Context-aware output encoding prevents untrusted text from being interpreted as executable markup.'],
    [1, 'HTTPS protects data while it travels between peers, but does not replace authorization.'],
    [2, 'Browser checks can be modified or bypassed, so the server must validate independently.'],
    [1, 'A trust boundary is where data crosses between different trust contexts.'],
  ],
  'cyber-threat-modeling': [
    [0, 'Mapping assets, components, and flows gives threat analysis a system context.'],
    [0, 'Trust boundaries highlight places where validation and authorization deserve attention.'],
    [3, 'Risk prioritization considers impact and likelihood.'],
    [1, 'An abuse case describes a plausible way a system could be misused.'],
    [0, 'Residual risk remains after selected controls have been applied.'],
  ],
  'data-fundamentals': [
    [0, 'A measurable question with clear scope guides data collection and analysis.'],
    [2, 'Measurement definitions and context are required to interpret a variable correctly.'],
    [1, 'Missingness may reveal a collection or recording issue and should be investigated.'],
    [3, 'The population is the group of entities the analysis question concerns.'],
    [0, 'Uncertainty communicates limits of the evidence and supports appropriate decisions.'],
  ],
  'data-analysis': [
    [0, 'A row commonly represents one observation or record in a table.'],
    [2, 'Column types should match the meaning of values and intended operations.'],
    [1, 'The median is often less affected by extreme values in skewed distributions.'],
    [3, 'Documented transformations make analysis traceable and reproducible.'],
    [0, 'Repeated rows should be understood before removal because they may be valid observations.'],
  ],
  'data-visualization': [
    [2, 'A line chart is commonly used to show change over ordered time.'],
    [1, 'Labels, scales, and time context support accurate interpretation.'],
    [3, 'Position and length on a common scale support precise comparisons.'],
    [1, 'Color should reinforce meaning and be paired with other cues for accessibility.'],
    [0, 'Truncating an axis can exaggerate apparent differences.'],
  ],
  'data-machine-learning': [
    [2, 'Preserving time order helps evaluation resemble predictions made about the future.'],
    [0, 'Leakage includes information that would not be available at prediction time.'],
    [3, 'Subgroup error analysis can reveal uneven failure patterns hidden by aggregate metrics.'],
    [1, 'A baseline tests whether added model complexity provides meaningful value.'],
    [2, 'Deployment decisions should consider metrics, error costs, limitations, and operational impact.'],
  ],
}

const quizQuestions = Object.entries(answerKeyByModule).flatMap(([moduleId, questions]) =>
  questions.map(([correctAnswer, explanation], index) => ({
    id: `${moduleId}-q${index + 1}`,
    moduleId,
    correctAnswer,
    explanation,
  })),
)

function getQuizQuestions(moduleId) {
  return quizQuestions.filter((question) => question.moduleId === moduleId)
}

module.exports = { quizQuestions, getQuizQuestions }
