import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Check, MessageSquareText } from "lucide-react";
import { useSendFeedback } from "@/hooks/feedback";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

const FeedbackModal = ({
  open,
  setOpen,
  triggerVisibile,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerVisibile?: boolean;
}) => {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [comment, setComment] = useState("");
  const [reccomendation, setReccomendation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { webId } = router.query;
  const { user } = useUser();
  const { mutateAsync: sendFeedback } = useSendFeedback();

  const handleSubmit = async () => {
    const result = await sendFeedback({
      rating,
      feedbackType,
      comment,
      reccomendation,
      webId: (webId as string) || null,
      userId: user?.id || null,
    });

    if (result) {
      setSubmitted(true);
    } else {
      toast.error("Failed to submit feedback");
    }

    setTimeout(() => {
      setRating(0);
      setFeedbackType("");
      setComment("");
      setReccomendation("");
      setSubmitted(false);
      setOpen(false);
    }, 2000);
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="transition-all duration-200 ease-in-out" asChild>
        <Button
          variant={"ghost"}
          className={`flex transition-all duration-200 ease-in-out items-center gap-2 text-xs ${triggerVisibile ? "" : "hidden"}`}
        >
          Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl rounded-lg border-0 shadow-lg">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                We Value Your Feedback
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Help us improve your experience with your thoughts and
                suggestions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  How would you rate your experience?
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingClick(value)}
                      className="text-2xl w-fit h-fit bg-transparent focus:outline-none transform transition-transform hover:scale-110"
                    >
                      <Star
                        size={26}
                        className={`${
                          rating >= value
                            ? "text-violet-400/80 fill-violet-400/80"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-type" className="text-sm font-medium">
                  What type of feedback would you like to share?
                </Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedback-type" className="w-full">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="issue">Report an Issue</SelectItem>
                    <SelectItem value="praise">Praise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium">
                  Your feedback
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts here..."
                  className="min-h-32 max-h-32 resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Would you recommend Spydr to others?
                </Label>
                <RadioGroup
                  defaultValue="yes"
                  className="flex gap-4 pt-2"
                  value={reccomendation}
                  onValueChange={setReccomendation}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe">Maybe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  variant={"secondary"}
                  className="w-full sm:w-auto"
                >
                  Submit Feedback
                </Button>
              </DialogFooter>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Thank You for Your Feedback!
            </h3>
            <p className="text-center text-gray-500">
              We appreciate your input and will use it to improve Spydr.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
