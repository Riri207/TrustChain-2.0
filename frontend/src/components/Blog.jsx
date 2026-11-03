import React from "react";

const blogs = [
  {
    id: 1,
    image: "/images/classroom.png",
    title: "Read how your donations can help the underprivileged students",
    date: "24 April 2024",
    link: "#",
  },
  {
    id: 2,
    image: "/images/notebook.png",
    title: "Your monthly donation can help children in need",
    date: "3 April 2024",
    link: "#",
  },
];

const BlogCard = ({ blog }) => (
  <a
    href={blog.link}
    className="group bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl"
  >
    <div className="h-64 w-full overflow-hidden bg-gray-200">
      <img
        src={blog.image}
        alt={blog.title}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
    </div>

    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 leading-snug transition-colors duration-300 group-hover:text-green-600">
        {blog.title}
      </h3>
      <p className="mt-3 text-gray-600 transition-colors duration-300 group-hover:text-green-600">
        {blog.date}
      </p>
    </div>
  </a>
);

const BlogSection = () => {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_2fr] items-center">
        {/* Left text */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Blog</h2>
          <p className="mt-4 text-xl text-gray-500 leading-relaxed">
            Packed with information, initiatives and impact of the social sector
          </p>
          <a
            href="#"
            className="inline-block mt-8 px-6 py-3 bg-white border border-gray-200 rounded-lg font-semibold text-gray-900 shadow-sm transition-all duration-300 hover:bg-green-500 hover:text-white hover:border-green-500 hover:shadow-lg active:bg-green-600 active:border-green-600 active:text-white"
          >
            Learn More
          </a>
        </div>

        {/* Right cards */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;