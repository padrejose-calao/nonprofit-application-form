import React, { useCallback, useState } from 'react';
import {
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Image,
  Film,
  Link,
  Plus,
  X,
  Upload,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from '../PermissionsLocker';

interface SocialMediaHandle {
  platform: string;
  username: string;
  url: string;
}

interface VideoLink {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'other';
}

interface DigitalAsset {
  type: 'logo' | 'banner' | 'other';
  file: File | null;
  url: string;
  description?: string;
}

interface DigitalAssetsSectionProps {
  formData: {
    organizationLogo?: string;
    bannerImage?: string;
    website?: string;
    socialMedia?: SocialMediaHandle[];
    videoLinks?: VideoLink[];
    digitalAssets?: DigitalAsset[];
  };
  onInputChange: (field: string, value: unknown) => void;
  onFileUpload?: (field: string, file: File) => void;
  errors?: Record<string, string>;
  locked?: boolean;
}

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, baseUrl: 'https://facebook.com/' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, baseUrl: 'https://twitter.com/' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, baseUrl: 'https://instagram.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, baseUrl: 'https://linkedin.com/in/' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, baseUrl: 'https://youtube.com/@' },
  { id: 'tiktok', name: 'TikTok', icon: Globe, baseUrl: 'https://tiktok.com/@' }
];

const DigitalAssetsSection: React.FC<DigitalAssetsSectionProps> = ({
  formData,
  onInputChange,
  onFileUpload,
  errors = {},
  locked = false
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const sectionLocked = locked || isLocked('digitalAssets');
  const canEdit = checkPermission('write', 'digitalAssets') && !sectionLocked;

  const [socialMedia, setSocialMedia] = useState<SocialMediaHandle[]>(
    (formData as any).socialMedia || []
  );
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>(
    (formData as any).videoLinks || []
  );
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>((formData as any).organizationLogo || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>((formData as any).bannerImage || null);

  // Handle social media updates
  const updateSocialMedia = (platform: string, username: string) => {
    const existing = socialMedia.find(s => s.platform === platform);
    const platformInfo = socialPlatforms.find(p => p.id === platform);
    
    if (!platformInfo) return;

    const url = username ? `${platformInfo.baseUrl}${username.replace('@', '')}` : '';
    
    let updated: SocialMediaHandle[];
    if (existing) {
      updated = socialMedia.map(s => 
        s.platform === platform ? { ...s, username, url } : s
      );
    } else if (username) {
      updated = [...socialMedia, { platform, username, url }];
    } else {
      updated = socialMedia;
    }
    
    setSocialMedia(updated);
    onInputChange('socialMedia', updated);
  };

  const removeSocialMedia = (platform: string) => {
    const updated = socialMedia.filter(s => s.platform !== platform);
    setSocialMedia(updated);
    onInputChange('socialMedia', updated);
  };

  // Handle video links
  const addVideoLink = () => {
    if (!newVideoUrl || !newVideoTitle) {
      toast.error('Please enter both video URL and title');
      return;
    }

    let platform: 'youtube' | 'vimeo' | 'other' = 'other';
    if (newVideoUrl.includes('youtube.com') || newVideoUrl.includes('youtu.be')) {
      platform = 'youtube';
    } else if (newVideoUrl.includes('vimeo.com')) {
      platform = 'vimeo';
    }

    const newVideo: VideoLink = {
      id: Date.now().toString(),
      title: newVideoTitle,
      url: newVideoUrl,
      platform
    };

    const updated = [...videoLinks, newVideo];
    setVideoLinks(updated);
    onInputChange('videoLinks', updated);
    
    setNewVideoUrl('');
    setNewVideoTitle('');
    toast.success('Video link added');
  };

  const removeVideoLink = (id: string) => {
    const updated = videoLinks.filter(v => v.id !== id);
    setVideoLinks(updated);
    onInputChange('videoLinks', updated);
  };

  // Handle file uploads
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setLogoPreview(url);
      onInputChange('organizationLogo', url);
      if (onFileUpload) {
        onFileUpload('organizationLogo', file);
      }
    };
    reader.readAsDataURL(file);
    
    toast.success('Logo uploaded successfully');
  }, [onInputChange, onFileUpload]);

  const handleBannerUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setBannerPreview(url);
      onInputChange('bannerImage', url);
      if (onFileUpload) {
        onFileUpload('bannerImage', file);
      }
    };
    reader.readAsDataURL(file);
    
    toast.success('Banner image uploaded successfully');
  }, [onInputChange, onFileUpload]);

  return (
    <div className="space-y-6">
      <SectionLock sectionId="digitalAssets" position="top" />

      {/* Website */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Website</h3>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-400" />
          <input
            type="url"
            placeholder="https://your-organization.org"
            value={(formData as any).website || ''}
            onChange={(e) => onInputChange('website', e.target.value)}
            disabled={!canEdit}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
          {(formData as any).website && (
            <a
              href={(formData as any).website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        {(errors as any).website && (
          <p className="mt-1 text-sm text-red-600">{(errors as any).website}</p>
        )}
      </div>

      {/* Logo and Banner */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Visual Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Organization Logo"
                    className="w-full h-32 object-contain"
                  />
                  {canEdit && (
                    <button
                      onClick={() => {
                        setLogoPreview(null);
                        onInputChange('organizationLogo', null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className={`block text-center cursor-pointer ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Upload Logo (PNG/JPG, max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={!canEdit}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt=""
                    className="w-full h-32 object-cover rounded"
                  />
                  {canEdit && (
                    <button
                      onClick={() => {
                        setBannerPreview(null);
                        onInputChange('bannerImage', null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <label className={`block text-center cursor-pointer ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Upload Banner (PNG/JPG, max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={!canEdit}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          These images will be managed in the Document Manager
        </p>
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Media</h3>
        <div className="space-y-3">
          {socialPlatforms.map(platform => {
            const Icon = platform.icon;
            const handle = socialMedia.find(s => s.platform === platform.id);
            
            return (
              <div key={platform.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-32">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{platform.name}:</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-gray-500">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={handle?.username || ''}
                    onChange={(e) => updateSocialMedia(platform.id, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                  {handle && (
                    <>
                      <a
                        href={handle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {canEdit && (
                        <button
                          onClick={() => removeSocialMedia(platform.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Video Links</h3>
        
        {/* Existing videos */}
        {videoLinks.length > 0 && (
          <div className="space-y-2 mb-4">
            {videoLinks.map((video, index) => (
              <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Film className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium">#{index + 1}: {video.title}</div>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {video.url}
                  </a>
                </div>
                {canEdit && (
                  <button
                    onClick={() => removeVideoLink(video.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new video */}
        {canEdit && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Video Title"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addVideoLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Video Link
            </button>
          </div>
        )}
        
        <p className="mt-2 text-sm text-gray-600">
          Add YouTube, Vimeo, or other video platform URLs
        </p>
      </div>

      {/* Info message */}
      {sectionLocked && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This section is currently locked. Contact an administrator to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <SectionLock sectionId="digitalAssets" position="bottom" />
    </div>
  );
};

export default DigitalAssetsSection;