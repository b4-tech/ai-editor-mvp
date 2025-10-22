import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Info, MessageSquare, Users, Smartphone, UserPlus } from 'lucide-react';

export function Phase2Notice() {
  const [open, setOpen] = React.useState(false);

  const phase2Features = [
    {
      icon: MessageSquare,
      title: 'Advanced Editor',
      description: 'Comments, track changes, and collaborative editing features',
      status: 'Coming Soon'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat Support',
      description: 'Get help or creative input from our AI assistant',
      status: 'Coming Soon'
    },
    {
      icon: Users,
      title: 'Multi-User Collaboration',
      description: 'Work with your team on treatments in real-time',
      status: 'Requires Backend'
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Review and edit treatments on your phone or tablet',
      status: 'In Development'
    },
    {
      icon: UserPlus,
      title: 'Human Writer Intervention',
      description: 'Collaborate with professional treatment writers',
      status: 'Premium Feature'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Coming Soon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phase 2 Features</DialogTitle>
          <DialogDescription>
            Exciting features planned for future releases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Currently using localStorage for data persistence. 
              Multi-user features will require a backend infrastructure.
            </p>
          </div>

          <div className="grid gap-4">
            {phase2Features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {feature.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Want to stay updated?</h4>
            <p className="text-sm text-muted-foreground">
              Follow our development progress and be the first to know when these features launch.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

