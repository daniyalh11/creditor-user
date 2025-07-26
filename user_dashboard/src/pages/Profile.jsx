import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Camera } from "lucide-react";
import { getUserAvatarUrl } from "@/lib/avatar-utils";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { fetchUserProfile, updateUserProfile } from "@/services/userService";

function Profile() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      bio: "Learning enthusiast and software developer",
      title: "Software Developer",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      timezone: "Asia/Kolkata" // Default to IST
    }
  });

  // Fetch user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchUserProfile();
        console.log('User profile data:', data); // Debug log
        setUserRole(
          Array.isArray(data.user_roles) && data.user_roles.length > 0
            ? data.user_roles.map(r => r.role).join(', ')
            : 'User'
        );
        // Store the first role in localStorage for sidebar access
        if (Array.isArray(data.user_roles) && data.user_roles.length > 0) {
          localStorage.setItem('userRole', data.user_roles[0].role);
        } else {
          localStorage.setItem('userRole', 'user');
        }
        // Store timezone in localStorage for use in other components
        localStorage.setItem('userTimezone', data.timezone || 'America/New_York');
        form.reset({
          fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email || 'Not Provided',
          bio: data.bio || '',
          title: data.title || '',
          phone: data.phone || '',
          location: data.location || '',
          timezone: data.timezone || 'Asia/Kolkata',
        });
      } catch (err) {
        console.log("Failed to load profile..", err);
      }
    }
    loadProfile();
  }, [form]);

  // Update user profile on submit
  const onSubmit = async (values) => {
    try {
      // Split fullName into first and last name
      const [first_name, ...rest] = values.fullName.split(" ");
      const last_name = rest.join(" ");
      await updateUserProfile({
        first_name,
        last_name,
        // email is not sent for update
        bio: values.bio,
        title: values.title,
        phone: values.phone,
        location: values.location,
        timezone: values.timezone,
      });
      // Update timezone in localStorage after successful profile update
      localStorage.setItem('userTimezone', values.timezone);
      toast.success("Profile updated successfully");
      window.location.reload(); // Reload page to reflect changes immediately
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarClick = () => {
    navigate('/avatar-picker?redirect=/profile');
  };

  useEffect(() => {
    const updateAvatar = () => {
      // This useEffect is no longer needed as avatarUrl is removed.
      // Keeping it for now in case it's re-added or for future context.
    };
    
    window.addEventListener("storage", updateAvatar);
    window.addEventListener("user-avatar-updated", updateAvatar);
    updateAvatar();
    
    return () => {
      window.removeEventListener("storage", updateAvatar);
      window.removeEventListener("user-avatar-updated", updateAvatar);
    };
  }, []);

  return (
    <div className="container max-w-4xl py-6 space-y-8 animate-fade-in">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src="/default-avatar.png" alt="Profile avatar" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-400 text-white">AJ</AvatarFallback>
          </Avatar>
          
          {/* <Button 
            size="icon"
            variant="secondary" 
            className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAvatarClick}
          >
            <Camera size={15} />
            <span className="sr-only">Change avatar</span>
          </Button> */}
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex flex-row items-center gap-2 sm:gap-4">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Profile Settings</h1>
            {userRole && (
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 capitalize">
                {userRole}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 w-full">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          {/* <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="w-full transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              {/* Removed user role display from here */}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" readOnly disabled className="bg-gray-100 cursor-not-allowed" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    {/* <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>

                  {/* <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* Timezone selection */}
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Los_Angeles">PST (Pacific Time US & Canada)</SelectItem>
                              <SelectItem value="America/Denver">MST (Mountain Time US & Canada)</SelectItem>
                              <SelectItem value="America/New_York">EST (Eastern Time US & Canada)</SelectItem>
                              <SelectItem value="Europe/London">GMT (Greenwich Mean Time)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-gradient-to-r from-primary to-purple-400 transition-all duration-300 hover:opacity-90">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <ProfileSecurity />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Profile;