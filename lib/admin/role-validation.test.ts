import assert from "node:assert/strict";
import { getAllowedRoleTransitions, isDepartmentAssignmentAllowed } from "./role-validation";

assert.deepEqual(getAllowedRoleTransitions("CITIZEN"), ["FIELD_WORKER", "MANAGER"]);
assert.deepEqual(getAllowedRoleTransitions("FIELD_WORKER"), ["CITIZEN", "MANAGER"]);
assert.deepEqual(getAllowedRoleTransitions("MANAGER"), ["CITIZEN", "FIELD_WORKER"]);
assert.deepEqual(getAllowedRoleTransitions("ADMIN"), ["CITIZEN", "FIELD_WORKER"]);

assert.equal(isDepartmentAssignmentAllowed("MANAGER", "dept-water"), true);
assert.equal(isDepartmentAssignmentAllowed("ADMIN", "dept-water"), false);
assert.equal(isDepartmentAssignmentAllowed("CITIZEN", null), false);
assert.equal(isDepartmentAssignmentAllowed("FIELD_WORKER", "dept-water"), true);

console.log("role validation checks passed");
