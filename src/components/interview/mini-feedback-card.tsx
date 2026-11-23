import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MiniFeedback = {
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  strength: string;
  improvement: string;
};

type MiniFeedbackCardProps = {
  feedback: MiniFeedback;
};

export function MiniFeedbackCard({ feedback }: MiniFeedbackCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Answer feedback</CardTitle>
        <CardDescription>Scores are estimates to guide practice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid grid-cols-3 gap-3 text-center">
          <div>
            <dt className="text-muted-foreground">Technical</dt>
            <dd className="text-lg font-semibold">{feedback.technicalScore}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Communication</dt>
            <dd className="text-lg font-semibold">{feedback.communicationScore}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Overall</dt>
            <dd className="text-lg font-semibold">{feedback.overallScore}</dd>
          </div>
        </dl>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Strength: </span>
            {feedback.strength}
          </li>
          <li>
            <span className="font-medium text-foreground">Improve: </span>
            {feedback.improvement}
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}