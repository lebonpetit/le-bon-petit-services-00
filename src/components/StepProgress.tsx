import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface Step {
    title: string;
}

interface StepProgressProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
    const progressPercent = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className={className}>
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        {/* Step circle */}
                        <div
                            className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${index < currentStep
                                    ? "bg-african-green text-white"
                                    : index === currentStep
                                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                        : "bg-secondary text-muted-foreground"
                                }
              `}
                        >
                            {index < currentStep ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                index + 1
                            )}
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`
                  h-0.5 w-8 sm:w-12 lg:w-16 mx-1 transition-all duration-300
                  ${index < currentStep ? "bg-african-green" : "bg-secondary"}
                `}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <Progress value={progressPercent} className="h-2 mb-4" />

            {/* Current step info */}
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                    {steps[currentStep]?.title}
                </span>
                <span className="text-muted-foreground">
                    Étape {currentStep + 1} sur {steps.length}
                </span>
            </div>
        </div>
    );
}
