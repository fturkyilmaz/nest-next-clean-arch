"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Mail, ExternalLink, FolderGit2, CalendarDays, ArrowRight } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO string
  tags: string[];
};

type Project = {
  name: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  stack: string[];
};

// Mock content (replace with your data source)
const posts: Post[] = [
  {
    slug: "clean-architecture-in-nest-next",
    title: "Clean Architecture in NestJS & Next.js: A Practical Guide",
    excerpt:
      "A step-by-step walkthrough of structuring scalable, testable applications using DDD, CQRS, and modular boundaries.",
    date: "2025-12-22",
    tags: ["Clean Architecture", "NestJS", "Next.js", "DDD"],
  },
  {
    slug: "schema-driven-development",
    title: "Schema-Driven Development with Prisma & TypeScript",
    excerpt:
      "Leverage strict typing, codegen, and validation to eliminate mismatches and speed up onboarding.",
    date: "2025-12-10",
    tags: ["Prisma", "TypeScript", "Codegen", "DX"],
  },
  {
    slug: "observability-opentelemetry",
    title: "Observability First: OpenTelemetry v2 in Monorepos",
    excerpt:
      "From resource configuration to tracing strategies—make debugging reproducible across environments.",
    date: "2025-11-28",
    tags: ["OpenTelemetry", "Tracing", "Monorepo", "DevOps"],
  },
];

const projects: Project[] = [
  {
    name: "Nest-Next Clean Arch",
    description:
      "Production-ready starter with CQRS, DDD, strict TypeScript, React Query, and seamless DX.",
    repoUrl: "https://github.com/fturkyilmaz/nest-next-clean-arch",
    demoUrl: "https://clean-arch-demo.example.com",
    stack: ["NestJS", "Next.js", "Prisma", "React Query", "Tailwind"],
  },
  {
    name: "Telemetry Toolkit",
    description:
      "Opinionated setup for OpenTelemetry v2 with multi-service tracing and maintainable configs.",
    repoUrl: "https://github.com/fturkyilmaz/telemetry-toolkit",
    stack: ["OpenTelemetry", "TypeScript", "Docker", "Grafana"],
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="absolute inset-0 -z-10 animate-gradient-shift bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-700/60 via-indigo-800/60 to-blue-900/60" />
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28">
            <Image
              src="https://avatars.githubusercontent.com/u/30223285?v=4"
              alt="Furkan Türkyılmaz"
              className="rounded-full object-cover shadow-2xl ring-4 ring-indigo-500/60"
              priority
              width={112} height={112}
            />
          </div>
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Merhaba, ben Furkan Türkyılmaz 👋</h1>
            <p className="text-lg opacity-85">
              Senior Software Consultant & Technical Trainer — Clean Architecture, DDD, DX, and scalable systems.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <Link
            href="https://github.com/fturkyilmaz"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
          >
            <Github className="w-5 h-5" />
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/furkanturkyilmaz"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            LinkedIn
          </Link>
          <Link
            href="mailto:furkan.turkyilmaz@example.com"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-md p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Hakkımda</h2>
          <p className="opacity-90 leading-relaxed">
            Maintainable, scalable, ve test edilebilir sistemler kurmayı seviyorum. NestJS, Prisma, Next.js ve React
            Native ile Clean Architecture prensiplerini gerçek dünyaya uygularım. Ekipleri hızlandıran kurallar,
            otomasyonlar ve onboarding netliği benim için vazgeçilmez. Kodun sadece çalışması yetmez—okunur, denetlenir
            ve genişletilebilir olmalıdır.
          </p>
        </div>
      </section>

      {/* Featured posts */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Yazılar</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
          >
            Tüm yazılar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/15"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-300 transition-colors">{post.title}</h3>
              <p className="text-sm opacity-80 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs opacity-75">
                  <CalendarDays className="w-4 h-4" />
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs rounded-full bg-indigo-500/30 px-2 py-1 text-indigo-100 border border-indigo-400/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-blue-300"
              >
                Devamını oku
                <ExternalLink className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="text-2xl font-bold mb-6">Öne Çıkan Projeler</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((proj) => (
            <div
              key={proj.name}
              className="rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur-md hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <FolderGit2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">{proj.name}</h3>
              </div>
              <p className="text-sm opacity-85 mb-4">{proj.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {proj.stack.map((s) => (
                  <span key={s} className="text-xs rounded-full bg-purple-500/30 px-2 py-1 border border-purple-400/30">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={proj.repoUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors"
                >
                  Repo
                  <Github className="w-4 h-4" />
                </Link>
                {proj.demoUrl && (
                  <Link
                    href={proj.demoUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 transition-colors"
                  >
                    Demo
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / contact */}
      <footer className="border-t border-white/20">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} Furkan Türkyılmaz. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="https://github.com/fturkyilmaz" target="_blank" className="hover:text-gray-300 transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/furkanturkyilmaz"
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="mailto:furkan.turkyilmaz@example.com" className="hover:text-gray-300 transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Local CSS animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 14s ease infinite;
        }
      `}</style>
    </main>
  );
}
