import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import Image from "next/image";
import spydrLogo from "@/assets/slogonobg.png";
import onboardingGraphic from "@/assets/Sig up/Group.svg";
import { useCompleteOnboarding } from "@/hooks/auth";

const stepOneSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  username: z.string(), // locked anyways
  bio: z.string().optional(),
});

const stepTwoSchema = z.object({
  occupation: z.string().min(1, "Please select an occupation"),
  company: z.string().optional(),
  purpose: z.string().min(1, "Please select a purpose"),
});

const stepThreeSchema = z.object({
  interest: z.string().min(1, "Please select or enter an interest"),
  customInterest: z.string().optional(),
});

type StepOneForm = z.infer<typeof stepOneSchema>;
type StepTwoForm = z.infer<typeof stepTwoSchema>;
type StepThreeForm = z.infer<typeof stepThreeSchema>;

interface OnboardingFlowProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  isGoogleSignup?: boolean;
  defaultWebId?: string;
}

export default function OnboardingFlow({
  username,
  firstName,
  lastName,
  isGoogleSignup = false,
  defaultWebId,
}: OnboardingFlowProps) {
  const { mutateAsync: completeOnboarding } = useCompleteOnboarding();
  const [step, setStep] = useState(1);
  const router = useRouter();

  const stepOneForm = useForm<StepOneForm>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      firstName: isGoogleSignup ? firstName : "",
      lastName: isGoogleSignup ? lastName : "",
      username: username || "",
      bio: "",
    },
  });

  const stepTwoForm = useForm<StepTwoForm>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      occupation: "",
      company: "",
      purpose: "",
    },
  });

  const stepThreeForm = useForm<StepThreeForm>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      interest: "",
      customInterest: "",
    },
  });

  const onStepOneSubmit = (data: StepOneForm) => {
    console.log("Step 1 data:", data);
    setStep(2);
  };

  const onStepTwoSubmit = (data: StepTwoForm) => {
    console.log("Step 2 data:", data);
    setStep(3);
  };

  const onStepThreeSubmit = async (data: StepThreeForm) => {
    console.log("Step 3 data:", data);

    // combine all data and submit
    const completeData = {
      ...stepOneForm.getValues(),
      ...stepTwoForm.getValues(),
      interest: data.interest === "other" ? data.customInterest : data.interest,
    };

    try {
      // submit onboarding data
      const result = await completeOnboarding(completeData);

      if (result) {
        // redirect to home page or the welcome web
        if (defaultWebId) {
          router.push(`/web/${defaultWebId}?welcome=true`);
        } else {
          router.push("/home");
        }
      } else {
        console.error("Failed to submit onboarding data");
      }
    } catch (error) {
      console.error("Error submitting onboarding data:", error);
    }
  };

  const skipRegistration = () => {
    if (defaultWebId) {
      router.push(`/web/${defaultWebId}`);
    } else {
      router.push("/home");
    }
  };

  // readonly if it's provided
  useEffect(() => {
    if (username) {
      stepOneForm.setValue("username", username);
    }
  }, [username, stepOneForm]);

  // testimonial data based on current step
  const testimonials = [
    {
      logo: spydrLogo,
      quote:
        "Spydr helps me organize my research and connect ideas in ways I never thought possible.",
      over: "Over 100,000 knowledge webs created",
      author: "Alex Chen",
      title: "UX Researcher",
    },
    {
      logo: spydrLogo,
      quote:
        "We needed a tool that could handle our complex information architecture while meeting strict performance requirements.",
      over: "Over 500 teams collaborating daily",
      author: "Sarah Johnson",
      title: "Product Manager",
    },
    {
      logo: spydrLogo,
      quote:
        "The introduction of Spydr has led to amazing performance and efficiency improvements in our knowledge management.",
      over: "Over 10 million connections made",
      author: "Michael Torres",
      title: "Knowledge Management Expert",
    },
  ];

  const currentTestimonial = testimonials[step - 1];

  // Occupation options
  const occupations = [
    "Student",
    "Software Developer",
    "Designer",
    "Product Manager",
    "Researcher",
    "Writer",
    "Entrepreneur",
    "Educator",
    "Marketing Professional",
    "Data Scientist",
    "Rather not say/Other",
  ];

  // Purpose options
  const purposes = [
    "Personal knowledge management",
    "Research",
    "Project planning",
    "Learning new topics",
    "Content organization",
    "Team collaboration",
    "Just exploring/I don't know yet",
  ];

  // Interest options
  const interests = [
    "Technology",
    "Science",
    "Arts & Literature",
    "Business & Entrepreneurship",
    "Education",
    "Health & Wellness",
    "Social Sciences",
    "Philosophy",
    "Environment & Sustainability",
    "Other (specify)",
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        {step === 1 && (
          <>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              Let&apos;s customize your Spydr setup
            </h1>
            <p className="text-muted-foreground mb-8">
              This will help us understand your preferences and goals
            </p>

            <Form {...stepOneForm}>
              <form
                onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={stepOneForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="given-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepOneForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="family-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={stepOneForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly={!!username}
                          className={username ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepOneForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormDescription>
                        Write some things about yourself!
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="I'm passionate about..."
                          className="min-h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    Step {step} of 3
                  </div>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Tell us about your work
            </h1>
            <p className="text-muted-foreground mb-8">
              This helps us tailor Spydr to your professional needs
            </p>

            <Form {...stepTwoForm}>
              <form
                onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={stepTwoForm.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you do for work</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an occupation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {occupations.map((occ) => (
                            <SelectItem key={occ} value={occ}>
                              {occ}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepTwoForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Where do you work?" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stepTwoForm.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you want to use Spydr for</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Step {step} of 3
                  </div>
                  <Button type="submit">Continue</Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              One last thing
            </h1>
            <p className="text-muted-foreground mb-8">
              Pick one thing that interests you or you&apos;ve been thinking
              about recently
            </p>

            <Form {...stepThreeForm}>
              <form
                onSubmit={stepThreeForm.handleSubmit(onStepThreeSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={stepThreeForm.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic of interest</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an interest" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interests.map((interest) => (
                            <SelectItem
                              key={interest}
                              value={
                                interest === "Other (specify)"
                                  ? "other"
                                  : interest
                              }
                            >
                              {interest}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {stepThreeForm.watch("interest") === "other" && (
                  <FormField
                    control={stepThreeForm.control}
                    name="customInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify your interest</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tell us what interests you"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Step {step} of 3
                  </div>
                  <Button type="submit">Let&apos;s Get Started</Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>

      {/* Right Section - Testimonial */}
      <div className="w-full md:w-1/2 bg-violet-400/80 text-white p-6 md:p-8 lg:p-12 flex flex-col justify-between items-start h-full border relative lg:rounded-r-md">
        <div className="w-full mx-auto mt-16 fadeIn">
          <div className="text-sm bg-slate-800/50 text-foreground px-3 py-1 rounded-full inline-block mb-4">
            {currentTestimonial.over}
          </div>

          <blockquote className="text-lg md:text-xl font-medium mb-6">
            &ldquo;{currentTestimonial.quote}&rdquo;
          </blockquote>

          <div>
            <div className="font-medium">{currentTestimonial.author}</div>
            <div className="text-foreground text-sm">
              {currentTestimonial.title}
            </div>
          </div>
        </div>{" "}
        <Image
          src={onboardingGraphic}
          alt="Onboarding Graphic"
          height={200}
          width={200}
        />
        <div className="absolute bottom-6 right-6">
          <Button
            variant="link"
            className="text-white hover:text-slate-300"
            onClick={skipRegistration}
          >
            Skip Registration
          </Button>
        </div>
      </div>
    </div>
  );
}
