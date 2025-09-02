import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Avatar } from "@heroui/react";
import { Icon } from '@iconify/react';
import { profileService, UserProfile } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({ name: data.name, phone: data.phone || '' });
    } catch (error) {
      showToast('Error fetching profile', 'error');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedProfile = await profileService.updateProfile(formData, imageFile || undefined);
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setIsEditing(false);
      setImageFile(null);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSrc = () => {
    if (profile?.image_url) {
      return `${API_BASE_URL.replace('/api', '')}${profile.image_url}`;
    }
    return undefined;
  };

  const getInitials = () => {
    return profile?.name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:user" />
            Profile
          </div>
        </ModalHeader>
        <ModalBody>
          {profile && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  src={getAvatarSrc()}
                  name={!profile?.image_url ? getInitials() : undefined}
                  size="lg"
                  className="w-20 h-20 text-large"
                />
                
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    startContent={<Icon icon="lucide:camera" />}
                  />
                )}
              </div>

              <div className="space-y-3">
                <Input
                  label="Name"
                  value={isEditing ? formData.name : profile.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                
                <Input
                  label="Email"
                  value={profile.email}
                  isReadOnly
                  variant="flat"
                />
                
                <Input
                  label="Phone"
                  value={isEditing ? formData.phone : (profile.phone || 'Not provided')}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {isEditing ? (
            <>
              <Button variant="flat" onPress={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSave} isLoading={loading}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};