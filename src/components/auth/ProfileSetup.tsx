
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";

const profileSchema = z.object({
  age: z.coerce.number().min(1, "Age is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  height: z.coerce.number().min(1, "Height is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update the user profile in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          age: data.age,
          weight: data.weight,
          height: data.height,
          gender: data.gender,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh the profile data in the auth context
      await refreshProfile();
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-fitmentor-cream">Set Up Your Profile</h2>
        <p className="text-fitmentor-medium-gray mt-2">
          Tell us about yourself so we can personalize your experience
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-semibold text-fitmentor-cream">Basics</h3>
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    className="premium-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Weight in kg"
                    className="premium-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Height in cm"
                    className="premium-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="premium-button w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Next"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSetup;
