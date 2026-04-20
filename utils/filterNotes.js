// utils/filterNotices.js

function canView(notice, user) {
  const v = notice.visibility;
  console.log(notice)
  console.log(user)
  // 🌍 Public → always visible
  if (v.role === "general") return true;

  // ❌ Not logged in → only public
  if (!user) return false;

  // 👑 Admin → sees everything
  if (user.role === "admin") return true;

  // 👨‍🏫 Faculty
  if (user.role === "faculty") {
    // Faculty notices → only same department
    if (v.role === "faculty") {
      return v.department === user.department;
    }

    // Student notices → same department (ignore class/batch for faculty view)
    if (v.role === "student") {
      return v.department === user.department;
    }

    return false;
  }

  // 🎓 Student
  if (user.role === "student") {
    if(v.batch) console.log(v)
    if (v.role === "student") {
      return (
        v.department === user.department &&
        // ✅ Optional filters
        (!v.class || v.class === user.class) &&
        (!v.batch || v.batch === user.batch)
      );
    }

    return false; // students cannot see faculty/admin notices
  }

  return false;
}

module.exports = { canView };