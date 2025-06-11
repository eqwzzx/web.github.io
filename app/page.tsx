import WebhookSenderForm from "@/components/webhook-sender-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-muted -mx-4 -mt-8 px-4 rounded-b-lg">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Send Discord Webhooks Effortlessly</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A powerful tool to manage and send messages via Discord webhooks.
          {user ? " Get started below!" : " Login with Discord to unlock all features."}
        </p>
      </section>

      {user ? (
        <WebhookSenderForm />
      ) : (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login with your Discord account to use the webhook sender and access other features.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Click the login button in the navigation bar to continue.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              (Or{" "}
              <Link href="/api/auth/discord" className="underline hover:text-primary">
                click here to login
              </Link>
              )
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}