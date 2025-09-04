import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Avatar, Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { profileService, UserProfile } from '../services/profileService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({ name: data.name, email: data.email, phone: data.phone || '' });
    } catch (error) {
      toast.error('Error fetching profile');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileService.updateProfile(formData, imageFile || undefined);
      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
      setImageFile(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSrc = () => {
    if (profile?.image_url) {
      const url = `${API_BASE_URL.replace('/api', '')}${profile.image_url}`;
      console.log('Avatar URL:', url, 'Image URL from profile:', profile.image_url);
      return url;
    }
    return undefined;
  };

  const getInitials = () => {
    return profile?.name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" style={{width: "100%"}}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon icon="lucide:user" />
        Profile
      </DialogTitle>
      <DialogContent>
        {profile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={getAvatarSrc()}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {!profile?.image_url ? getInitials() : undefined}
              </Avatar>
              
              {isEditing && (
                <TextField
                  type="file"
                  inputProps={{ accept: 'image/*' }}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    setImageFile(target.files?.[0] || null);
                  }}
                  InputProps={{
                    startAdornment: <Icon icon="lucide:camera" className="mr-2" />,
                  }}
                  style={{width: "100%"}}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={isEditing ? formData.name : profile.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? "outlined" : "filled"}
                style={{width: "100%"}}
              />
              
              <TextField
                label="Email"
                value={isEditing ? formData.email : profile.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? "outlined" : "filled"}
                style={{width: "100%"}}
              />
              
              <TextField
                label="Phone"
                value={isEditing ? formData.phone : (profile.phone || 'Not provided')}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? "outlined" : "filled"}
                style={{width: "100%"}}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {isEditing ? (
          <>
            <button onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button onClick={onClose}>
              Close
            </button>
            <button variant="contained" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};