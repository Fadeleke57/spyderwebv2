import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface DynamicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const DynamicTextarea: React.FC<DynamicTextareaProps> = ({
  onInput,
  onChange,
  onValueChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate scrollHeight
      textareaRef.current.style.height = "auto";
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    // Initial height adjustment
    adjustHeight();
  }, [props.defaultValue]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onInput && onInput(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange && onChange(e);
    onValueChange && onValueChange(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      {...props}
      className={`
        w-full 
        min-h-[1px] 
        bg-transparent 
        p-0 
        resize-none 
        focus:outline-none 
        border-none 
        bg-none 
        ring-offset-none 
        focus-visible:ring-0 
        focus-visible:ring-offset-0 
        no-scrollbar
        ${props.className || ""}
      `}
      onInput={handleInput}
      onChange={handleChange}
      rows={1}
    />
  );
};
