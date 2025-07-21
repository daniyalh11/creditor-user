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
        form.reset({
          fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email || '',
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
        email: values.email,
        bio: values.bio,
        title: values.title,
        phone: values.phone,
        location: values.location,
        timezone: values.timezone,
      });
      toast.success("Profile updated successfully");
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

        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
                              <SelectItem value="Asia/Kolkata">IST (India Standard Time)</SelectItem>
                              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                              <SelectItem value="America/New_York">EST (Eastern Time US & Canada)</SelectItem>
                              <SelectItem value="America/Chicago">CST (Central Time US & Canada)</SelectItem>
                              <SelectItem value="America/Denver">MST (Mountain Time US & Canada)</SelectItem>
                              <SelectItem value="America/Los_Angeles">PST (Pacific Time US & Canada)</SelectItem>
                              <SelectItem value="America/Phoenix">MST (Arizona - no DST)</SelectItem>
                              <SelectItem value="America/Anchorage">AKST (Alaska Standard Time)</SelectItem>
                              <SelectItem value="America/Adak">HST (Hawaii-Aleutian Standard Time)</SelectItem>
                              <SelectItem value="America/Argentina/Buenos_Aires">ART (Argentina Time)</SelectItem>
                              <SelectItem value="America/Sao_Paulo">BRT (Brasilia Time, Brazil)</SelectItem>
                              <SelectItem value="America/Bogota">COT (Colombia Time)</SelectItem>
                              <SelectItem value="America/Caracas">VET (Venezuela Time)</SelectItem>
                              <SelectItem value="America/Lima">PET (Peru Time)</SelectItem>
                              <SelectItem value="America/Mexico_City">CST (Mexico City)</SelectItem>
                              <SelectItem value="America/Toronto">EST (Toronto, Canada)</SelectItem>
                              <SelectItem value="America/Vancouver">PST (Vancouver, Canada)</SelectItem>
                              <SelectItem value="America/Guatemala">CST (Central America)</SelectItem>
                              <SelectItem value="America/La_Paz">BOT (Bolivia Time)</SelectItem>
                              <SelectItem value="America/Santiago">CLT (Chile Standard Time)</SelectItem>
                              <SelectItem value="America/Halifax">AST (Atlantic Standard Time, Canada)</SelectItem>
                              <SelectItem value="America/St_Johns">NST (Newfoundland Standard Time, Canada)</SelectItem>
                              <SelectItem value="America/Montevideo">UYT (Uruguay Time)</SelectItem>
                              <SelectItem value="America/Panama">EST (Panama Time)</SelectItem>
                              <SelectItem value="America/Port_of_Spain">AST (Trinidad & Tobago)</SelectItem>
                              <SelectItem value="America/Puerto_Rico">AST (Puerto Rico)</SelectItem>
                              <SelectItem value="America/El_Salvador">CST (El Salvador)</SelectItem>
                              <SelectItem value="America/Managua">CST (Nicaragua)</SelectItem>
                              <SelectItem value="America/Costa_Rica">CST (Costa Rica)</SelectItem>
                              <SelectItem value="America/Guayaquil">ECT (Ecuador Time)</SelectItem>
                              <SelectItem value="America/Asuncion">PYT (Paraguay Time)</SelectItem>
                              <SelectItem value="America/Havana">CST (Cuba Standard Time)</SelectItem>
                              <SelectItem value="America/Barbados">AST (Barbados)</SelectItem>
                              <SelectItem value="America/Jamaica">EST (Jamaica)</SelectItem>
                              <SelectItem value="America/Belize">CST (Belize)</SelectItem>
                              <SelectItem value="America/Aruba">AST (Aruba)</SelectItem>
                              <SelectItem value="America/Curacao">AST (Curacao)</SelectItem>
                              <SelectItem value="America/Port-au-Prince">EST (Haiti)</SelectItem>
                              <SelectItem value="America/Paramaribo">SRT (Suriname Time)</SelectItem>
                              <SelectItem value="America/Grand_Turk">EST (Turks and Caicos)</SelectItem>
                              <SelectItem value="America/Martinique">AST (Martinique)</SelectItem>
                              <SelectItem value="America/Cayenne">GFT (French Guiana Time)</SelectItem>
                              <SelectItem value="America/Grenada">AST (Grenada)</SelectItem>
                              <SelectItem value="America/Dominica">AST (Dominica)</SelectItem>
                              <SelectItem value="America/Antigua">AST (Antigua & Barbuda)</SelectItem>
                              <SelectItem value="America/St_Lucia">AST (Saint Lucia)</SelectItem>
                              <SelectItem value="America/St_Vincent">AST (Saint Vincent & Grenadines)</SelectItem>
                              <SelectItem value="America/St_Kitts">AST (Saint Kitts & Nevis)</SelectItem>
                              <SelectItem value="America/Montserrat">AST (Montserrat)</SelectItem>
                              <SelectItem value="America/Bahia">BRT (Bahia, Brazil)</SelectItem>
                              <SelectItem value="America/Fortaleza">BRT (Fortaleza, Brazil)</SelectItem>
                              <SelectItem value="America/Recife">BRT (Recife, Brazil)</SelectItem>
                              <SelectItem value="America/Belem">BRT (Belem, Brazil)</SelectItem>
                              <SelectItem value="America/Manaus">AMT (Manaus, Brazil)</SelectItem>
                              <SelectItem value="America/Boa_Vista">AMT (Boa Vista, Brazil)</SelectItem>
                              <SelectItem value="America/Porto_Velho">AMT (Porto Velho, Brazil)</SelectItem>
                              <SelectItem value="America/Campo_Grande">AMT (Campo Grande, Brazil)</SelectItem>
                              <SelectItem value="America/Cuiaba">AMT (Cuiaba, Brazil)</SelectItem>
                              <SelectItem value="America/Rio_Branco">ACT (Acre, Brazil)</SelectItem>
                              <SelectItem value="America/Nassau">EST (Bahamas)</SelectItem>
                              <SelectItem value="America/Tegucigalpa">CST (Honduras)</SelectItem>
                              <SelectItem value="America/Santo_Domingo">AST (Dominican Republic)</SelectItem>
                              <SelectItem value="America/Guadeloupe">AST (Guadeloupe)</SelectItem>
                              <SelectItem value="America/St_Barthelemy">AST (Saint Barthelemy)</SelectItem>
                              <SelectItem value="Europe/London">GMT (Greenwich Mean Time)</SelectItem>
                              <SelectItem value="Asia/Tokyo">JST (Japan Standard Time)</SelectItem>
                              <SelectItem value="Australia/Sydney">AEST (Australian Eastern Time)</SelectItem>
                              {/* Add more as needed */}
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