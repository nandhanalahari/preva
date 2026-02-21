import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByEmail, findUserByUsername, verifyPassword } from "@/lib/users"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password || typeof credentials.password !== "string") return null
        const email = credentials.email as string | undefined
        const username = credentials.username as string | undefined

        if (email?.trim()) {
          const user = await findUserByEmail(email)
          if (!user) return null
          const db = await import("@/lib/mongodb").then((m) => m.getDb())
          const doc = await db.collection("users").findOne({ email: email.trim().toLowerCase() })
          if (!doc?.passwordHash) return null
          const ok = await verifyPassword(doc as import("@/lib/mongodb").UserDoc & { _id: import("mongodb").ObjectId }, credentials.password)
          if (!ok) return null
          return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role, image: null }
        }

        if (username?.trim()) {
          const doc = await findUserByUsername(username)
          if (!doc) return null
          const ok = await verifyPassword(doc, credentials.password)
          if (!ok) return null
          return {
            id: doc._id.toString(),
            email: doc.email ?? undefined,
            name: doc.username ?? undefined,
            role: doc.role,
            image: null,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.email = user.email ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/signin" },
})
