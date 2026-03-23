import { Card } from "@/components/ui/card";
import HeroBanner from "./components/layout/app.hero";
import { Calendar, Globe, Shield, Users, Video, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "./components/layout/app.header";
import Footer from "./components/layout/app.footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroBanner />

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need for great meetings
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make your video calls productive and enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">HD Video & Audio</h3>
            <p className="text-muted-foreground">
              Crystal-clear video and audio quality for professional meetings
            </p>
          </Card>

          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Invite up to 100 participants and collaborate in real-time
            </p>
          </Card>

          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
            <p className="text-muted-foreground">
              Schedule meetings and send calendar invites effortlessly
            </p>
          </Card>

          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              End-to-end encryption keeps your conversations private
            </p>
          </Card>

          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cross-Platform</h3>
            <p className="text-muted-foreground">
              Works seamlessly across all devices and browsers
            </p>
          </Card>

          <Card className="p-8" >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Join</h3>
            <p className="text-muted-foreground">
              No downloads required - join meetings with one click
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 mb-20">
        <Card className="p-12 md:p-16 text-center bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using Meetly for their video meetings
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Start your first meeting
            </Button>
          </Link>
        </Card>
      </section>
      <Footer />
    </>
  );
}
