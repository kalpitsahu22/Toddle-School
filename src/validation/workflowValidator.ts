import { Workflow, ValidationResult, ValidationIssue } from '../types/workflow';

export function validateWorkflow(workflow: Workflow): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(workflow.nodes.map((n) => n.id));

  // 1. Check for Trigger Node
  const triggers = workflow.nodes.filter((n) => n.type === 'trigger');
  if (triggers.length === 0) {
    issues.push({
      id: 'missing-trigger',
      type: 'error',
      message: 'Workflow must have at least one Trigger node to start execution.'
    });
  }

  // 2. Validate Edges
  workflow.edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      issues.push({
        id: `broken-edge-source-${edge.id}`,
        type: 'error',
        message: `Edge ${edge.id} references non-existent source node "${edge.source}".`
      });
    }
    if (!nodeIds.has(edge.target)) {
      issues.push({
        id: `broken-edge-target-${edge.id}`,
        type: 'error',
        message: `Edge ${edge.id} references non-existent target node "${edge.target}".`
      });
    }
  });

  // 3. Validate Individual Nodes
  workflow.nodes.forEach((node) => {
    const { data, type, id } = node;

    if (!data.label || data.label.trim() === '') {
      issues.push({
        id: `empty-label-${id}`,
        nodeId: id,
        type: 'warning',
        message: `Node "${id}" is missing a title/label.`
      });
    }

    // Outgoing edges for this node
    const outgoingEdges = workflow.edges.filter((e) => e.source === id);
    const incomingEdges = workflow.edges.filter((e) => e.target === id);

    // Non-trigger nodes should ideally have incoming edges
    if (type !== 'trigger' && incomingEdges.length === 0) {
      issues.push({
        id: `unreachable-node-${id}`,
        nodeId: id,
        type: 'warning',
        message: `Node "${data.label}" has no incoming connection and will never be executed.`
      });
    }

    // Type-specific validations
    switch (type) {
      case 'action':
        if (data.actionService === 'email' && (!data.recipient || data.recipient.trim() === '')) {
          issues.push({
            id: `action-missing-recipient-${id}`,
            nodeId: id,
            type: 'error',
            message: `Email Action "${data.label}" is missing a recipient address or merge variable.`,
            field: 'recipient'
          });
        }
        if (data.actionService === 'sis_sync' && (!data.sisEndpoint || data.sisEndpoint.trim() === '')) {
          issues.push({
            id: `action-missing-sis-${id}`,
            nodeId: id,
            type: 'warning',
            message: `SIS Sync Action "${data.label}" has no endpoint URL specified.`,
            field: 'sisEndpoint'
          });
        }
        break;

      case 'condition':
        if (outgoingEdges.length === 0) {
          issues.push({
            id: `condition-no-branches-${id}`,
            nodeId: id,
            type: 'error',
            message: `Condition "${data.label}" has no outgoing branch connections.`,
            field: 'branches'
          });
        } else if (data.nodeSubtype === 'boolean_check' && outgoingEdges.length < 2) {
          issues.push({
            id: `condition-missing-fallback-${id}`,
            nodeId: id,
            type: 'warning',
            message: `Condition "${data.label}" only has 1 outgoing branch. Ensure both TRUE and FALSE branches are connected.`,
            field: 'branches'
          });
        }
        break;

      case 'human':
        if (!data.assignedRole || data.assignedRole.trim() === '') {
          issues.push({
            id: `human-missing-role-${id}`,
            nodeId: id,
            type: 'warning',
            message: `Human Review "${data.label}" does not have an assigned reviewer role.`,
            field: 'assignedRole'
          });
        }
        if (!data.allowedOutcomes || data.allowedOutcomes.length === 0) {
          issues.push({
            id: `human-missing-outcomes-${id}`,
            nodeId: id,
            type: 'error',
            message: `Human Review "${data.label}" has no decision actions defined.`,
            field: 'allowedOutcomes'
          });
        }
        break;

      case 'goal':
        if (!data.goalTargetMetric) {
          issues.push({
            id: `goal-missing-metric-${id}`,
            nodeId: id,
            type: 'error',
            message: `Goal Node "${data.label}" must define a target metric objective.`,
            field: 'goalTargetMetric'
          });
        }
        const hasSuccessBranch = outgoingEdges.some(
          (e) => e.sourceHandle === 'success' || !e.sourceHandle
        );
        if (!hasSuccessBranch) {
          issues.push({
            id: `goal-missing-success-branch-${id}`,
            nodeId: id,
            type: 'warning',
            message: `Goal Node "${data.label}" has no connected success path.`
          });
        }
        break;

      case 'delay':
        if (data.delayDuration !== undefined && data.delayDuration <= 0) {
          issues.push({
            id: `delay-invalid-duration-${id}`,
            nodeId: id,
            type: 'warning',
            message: `Delay "${data.label}" duration must be greater than 0.`
          });
        }
        break;
    }
  });

  const hasErrors = issues.some((i) => i.type === 'error');

  return {
    isValid: !hasErrors,
    issues
  };
}
