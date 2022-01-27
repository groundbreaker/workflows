const core = require("@actions/core");
const github = require('@actions/github');

const DEV_FLOW_ALLOWED_HEADS = Object.freeze(
  [/^bugfix.*/, /^enhancement.*/, /^feature.*/, /^feat.*/, /^refactor.*/, /^refac.*/, /^doc.*/, /^chore.*/]
);

const gitFlowRules = [
  {
    allowedHeads: DEV_FLOW_ALLOWED_HEADS,
    allowedBases: [...DEV_FLOW_ALLOWED_HEADS, /^develop$/]
  },
  {
    allowedHeads: [/^develop$/],
    allowedBases: [/^release.*/]
  },
  {
    allowedHeads: [/^release.*/, /^hotfix.*/, /^backport.*/],
    allowedBases: [/^main$/, /^master$/]
  }
];

function getAllowedBasesFor(head) {
  const rule = gitFlowRules.find(({ allowedHeads }) => {
    return !!allowedHeads.find(allowedHead => allowedHead.test(head));
  });
  if (!rule) {
    throw new Error("This branch name is invalid.");
  }
  return rule.allowedBases;
}

function validateBase({ allowedBases, base }) {
  const isBaseValid = allowedBases.find(allowedBase => allowedBase.test(base));
  if (!isBaseValid) {
    throw new Error("The base branch is invalid.");
  }
}

function validateGitFlow({ head, base }) {
  const allowedBases = getAllowedBasesFor(head);
  validateBase({ allowedBases, base });
}

try {
  const { head: { ref: head }, base: { ref: base } } = github.context.payload.pull_request;
  validateGitFlow({ head, base });

} catch (error) {
  core.setFailed(error.message);
}
