import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const conceptSchema = z.object({
  name: z.string().min(1, "Concept name is required"),
  definition: z.string().min(1, "Definition is required"),
});

type ConceptFormData = z.infer<typeof conceptSchema>;

interface CustomConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (concept: { name: string; definition: string }) => void;
  initialName?: string;
}

export const CustomConceptModal = ({
  isOpen,
  onClose,
  onSave,
  initialName = "",
}: CustomConceptModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      name: initialName,
      definition: "",
    },
  });

  // Update form when modal opens or initialName changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialName,
        definition: "",
      });
    }
  }, [isOpen, initialName, reset]);

  const onSubmit = (data: ConceptFormData) => {
    onSave({ name: data.name, definition: data.definition });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Define Custom Concept</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Concept Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Neural Networks"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              {...register("definition")}
              placeholder="Provide a detailed definition of this concept..."
              rows={4}
            />
            {errors.definition && (
              <p className="text-sm text-destructive">{errors.definition.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Concept</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};