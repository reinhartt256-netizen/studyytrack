# Security Specification - StudyyTrack Database Rules

This specification establishes Zero-Trust, Attribute-Based Access Control (ABAC) policies for the StudyyTrack SaaS platform database.

## 1. Data Invariants
- **User Integrity**: Users can only register and modify their own user data profiles. No identity spoofing is permitted.
- **Classroom Structure**: Only registered teachers can create classes.
- **Task Authority**: Only the teacher who assigned a task can view/edit or delete it, and only matching classes receive the assignments.
- **Siswa Submissions**: A homework submission can only be uploaded by a verified student who is registered. Only the assigned teacher can add scores or feedback (graded status).
- **Attendance Registry**: Only teachers can record or edit daily attendance.
- **Notification Safety**: A user can only read, update (e.g., mark as read), or delete notifications belonging to their specific user ID.

## 2. The "Dirty Dozen" Spoof/Attack Payloads
1. **User Spoof ID**: Attempting to create a user profile inside `/users/attacker-id` representing user "reinhartt256@gmail.com" but with different uid.
2. **Admin Privilege Escalation**: Attempting to write a user profile with unauthorized roles.
3. **Class Overwrite**: Attempting to modify a class structure from a student account.
4. **Illegal Task Creation**: A student attempts to publish an assignment targeting classes they do not belong to.
5. **Score Injection (Student)**: Student attempts to grade their own submission by sending `score: 100` and `status: "graded"`.
6. **Feedback Injection (Student)**: Student attempts to overwrite teacher feedback on their graded submission.
7. **Identity Poisoning (Path)**: Attempting to write a document with an ID exceeding 128 characters or containing unsafe injection sequences into the path.
8. **Malicious Attendance Logging**: A student logging themselves as "Hadir" instead of "Alfa".
9. **Private Information Exposing**: Non-owners attempting to list the central `/users` collection without proper credentials.
10. **Notification Hijack**: Attempting to write or update notifications belonging to another classmate.
11. **System Field Corruptor**: Client trying to inject a system-state variable into a task document.
12. **Zombie Submission Update**: Re-submitting or changing fields of an already graded submission.

## 3. The Firebase Security Rules Definition
The rules will be implemented in `firestore.rules`, starting with restrictive default closed-gate checks and checking identity, validation models, and authorization scopes.
