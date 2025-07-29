# Debugging Best Practices

## Core Principles

1. **Work Backwards from the Problem**
   - Start at the error/issue manifestation
   - Trace back through the execution path
   - Identify the earliest point where behavior deviates
   - Example: If a UI element doesn't change color, find where the color variable is defined and trace its modifications

2. **State-Based Analysis**
   - Document the expected state at each step
   - Compare with actual state
   - Track state changes through the execution flow
   - Use debug logging strategically

3. **Isolation First**
   - Reduce the problem to its smallest reproducible case
   - Remove unrelated code/components
   - Test in isolation before testing integration
   - Create minimal test cases

## Systematic Debugging Process

### 1. Information Gathering
- Collect all error messages
- Document the exact steps to reproduce
- Identify patterns (timing, user actions, data conditions)
- Gather relevant logs
- Note system state (browser version, OS, etc.)

### 2. Hypothesis Formation
- Form a specific, testable hypothesis
- Base it on observed behavior
- Consider similar past issues
- Document your reasoning

### 3. Testing & Validation
- Create specific tests for your hypothesis
- Use logging to confirm execution paths
- Verify state at each step
- Test edge cases
- Validate fixes in isolation

### 4. Implementation & Verification
- Make minimal, focused changes
- Test the complete execution path
- Verify no regression
- Document the solution and reasoning

## Common Pitfalls to Avoid

1. **Assumption-Based Debugging**
   - ❌ Assuming the problem location
   - ✅ Follow the execution path with evidence
   
2. **Scatter-Shot Fixes**
   - ❌ Making multiple changes at once
   - ✅ Make one focused change at a time

3. **Ignoring Context**
   - ❌ Looking only at the error location
   - ✅ Understanding the full execution context

4. **Incomplete Validation**
   - ❌ Testing only the happy path
   - ✅ Testing edge cases and error conditions

## Debugging Tools & Techniques

### 1. Strategic Logging
```javascript
// Bad: console.log("here");
// Good:
debug.log({
  event: "userLogin",
  state: { isAuthenticated, userId },
  timestamp: new Date()
});
```

### 2. State Snapshots
```javascript
// Take snapshots at critical points
function debugSnapshot(label, state) {
  debug.log(`[${label}] State:`, {
    timestamp: new Date(),
    ...state,
    stackTrace: new Error().stack
  });
}
```

### 3. Error Boundaries
```javascript
try {
  // Potentially problematic code
  await processUserData(data);
} catch (error) {
  // Detailed error logging
  logger.error({
    message: 'User data processing failed',
    error: error.message,
    stack: error.stack,
    userData: data
  });
}
```

## Real-World Example

### Problem: Login Command Leaking to API

#### Bad Approach:
1. Add random console.logs
2. Try different command patterns
3. Make multiple unrelated changes
4. Hope it works

#### Good Approach:
1. **Identify the Flow**
   - Track command from input
   - Follow through command detection
   - Monitor request composition
   - Check API call contents

2. **Isolate the Issue**
   - Test command detection in isolation
   - Verify session history manipulation
   - Check request body formation

3. **Fix with Evidence**
   - Add specific logging
   - Make targeted changes
   - Validate complete flow
   - Test edge cases

## What Not To Do: A Real Case Study

### Case: File Creation Tool Failure
This example shows how NOT to debug an issue, demonstrated by an AI assistant's actual failure.

#### The Problem:
Attempting to create a debugging.md file in a repository.

#### The Bad Approach Used:
1. **Immediate Action Without Context**
   ```
   // First attempt
   create_file(content, path) // Failed
   // Immediate retry without understanding why
   create_file(content, path) // Failed again
   ```

2. **Ignoring Error Messages**
   - Failed to check if file existed
   - Didn't read the error message stating "File already exists"
   - Continued with same failing approach

3. **Multiple Tool Attempts Without Analysis**
   ```
   // Second approach - same mistake
   replace_string_in_file("", newContent) // Failed
   // Third approach - still no error analysis
   replace_string_in_file(null, newContent) // Failed
   ```

4. **Late Context Gathering**
   - Only after multiple failures did we finally check the file content
   ```javascript
   read_file(path) // Should have been the FIRST step
   ```

#### What Should Have Been Done:
1. **Check Existence First**
   ```javascript
   // Should have started with
   read_file(path)
   // Then based on result, either
   create_file() or replace_string_in_file()
   ```

2. **Read Error Messages**
   - Parse error message: "File already exists"
   - Determine appropriate tool for the situation
   - Choose correct approach based on file state

3. **Understand Available Tools**
   - create_file: For new files only
   - replace_string_in_file: For existing files
   - read_file: For checking current state

4. **Follow Systematic Approach**
   - Check current state
   - Choose appropriate tool
   - Verify changes
   - Test result

#### Lessons Learned:
1. Always gather context before acting
2. Read and understand error messages
3. Use appropriate tools for the situation
4. Verify state before making changes

## Best Practices Checklist

### Before Starting
- [ ] Can you reproduce the issue consistently?
- [ ] Do you have the complete error message?
- [ ] Have you identified the minimal test case?
- [ ] Are your debugging tools ready?

### During Debugging
- [ ] Are you logging the right information?
- [ ] Are you validating assumptions?
- [ ] Are you testing one change at a time?
- [ ] Are you documenting your findings?

### After Fixing
- [ ] Have you tested edge cases?
- [ ] Have you verified no regression?
- [ ] Have you documented the solution?
- [ ] Have you added preventive tests?

## Conclusion

Effective debugging is systematic and evidence-based. Always:
1. Work backwards from the problem
2. Gather evidence before making changes
3. Test one hypothesis at a time
4. Validate thoroughly
5. Document your findings

Remember: The goal is not just to fix the bug, but to understand why it occurred and prevent similar issues in the future.