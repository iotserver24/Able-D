import { index, route } from "@react-router/dev/routes";

export default [
  // Index route (home page)
  index("routes/home.jsx"),

  route("/login", "routes/students/studentAuth.jsx"),

  route("/teacher", "routes/teacher.jsx"),
  route("/students", "students/students.jsx"),
  
    // TODO: this below things is for example only, you can remove it

    // Additional routes - you can add as many as you need
    //   route("/about", "routes/about.jsx"),
    //   route("/contact", "routes/contact.jsx"),
    //   route("/products", "routes/products.jsx"),
  
    // Nested routes example
    //   route("/dashboard", "routes/dashboard.jsx", [
    //     route("profile", "routes/dashboard/profile.jsx"),
    //     route("settings", "routes/dashboard/settings.jsx"),
    //   ]),
  
    // Dynamic routes with parameters
    //   route("/user/:id", "routes/user.jsx"),
    //   route("/blog/:slug", "routes/blog-post.jsx"),
];
