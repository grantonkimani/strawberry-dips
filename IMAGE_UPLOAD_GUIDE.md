# Image Upload Functionality

## Overview
The wines and liquor section now includes a fully functional image upload system with drag-and-drop support, image preview, and validation.

## Features

### 🖼️ Image Upload Component (`ImageUpload.tsx`)
- **Drag & Drop Support**: Users can drag images directly onto the upload area
- **File Selection**: Click to open file browser
- **Image Preview**: Real-time preview of uploaded images
- **File Validation**: 
  - Supported formats: JPEG, PNG, WebP
  - Maximum file size: 5MB
  - Type validation before upload
- **Error Handling**: Clear error messages for invalid files
- **Upload Progress**: Visual feedback during upload
- **Image Removal**: Easy removal of uploaded images

### 🔌 API Endpoint (`/api/upload-wine-liquor-image`)
- **POST**: Upload new images
- **DELETE**: Remove existing images
- **File Storage**: Images saved to `public/uploads/wine-liquor/`
- **Unique Naming**: Timestamp + random string prevents conflicts
- **Security**: File type and size validation

### 🛠️ Admin Integration
- **Seamless Integration**: Image upload component integrated into admin form
- **Real-time Updates**: Form updates immediately with uploaded image URL
- **Image Management**: Easy replacement and removal of product images

## Usage

### For Admins
1. Navigate to `/admin/wine-liquor-products`
2. Create or edit a product
3. Use the image upload area to:
   - Drag and drop an image
   - Click "Choose File" to select from device
   - Preview the image before saving
   - Remove or replace existing images

### For Developers
```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  currentImageUrl={product.image_url}
  onImageUpload={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
  onImageRemove={() => setFormData({ ...formData, image_url: '' })}
  productType="wine-liquor"
/>
```

## File Structure
```
public/
  uploads/
    wine-liquor/
      [timestamp]-[random].jpg
      [timestamp]-[random].png
      ...
```

## Security Features
- File type validation (only images)
- File size limits (5MB max)
- Unique filename generation
- Server-side validation
- Error handling for failed uploads

## Browser Support
- Modern browsers with File API support
- Drag and drop functionality
- Image preview capabilities
- Progress indicators
