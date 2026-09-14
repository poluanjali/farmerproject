import React, { useRef } from 'react';
import { Camera, UploadCloud, X, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_FIELD_ITEMS } from '../sampleData';
import { SampleFieldItem, RegionalLanguage } from '../types';
import { formatBilingual } from '../utils/translations';
import { BilingualText } from './BilingualText';

interface PhotoUploaderProps {
  currentLanguage: RegionalLanguage;
  selectedImage: string | null;
  onImageSelected: (base64OrUrl: string, sampleItem?: SampleFieldItem) => void;
  onClearImage: () => void;
  isLoading: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentLanguage,
  selectedImage,
  onImageSelected,
  onClearImage,
  isLoading,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can choose the same file again if needed
    e.target.value = '';
  };

  return (
    <div id="photo-uploader-section" className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <span>{formatBilingual('1. Upload Crop or Soil Photo', 'uploadPhotoPrompt', currentLanguage.code)}</span>
        </h2>
        {selectedImage && (
          <button
            type="button"
            onClick={onClearImage}
            disabled={isLoading}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>{formatBilingual('Remove', 'cancel', currentLanguage.code)}</span>
          </button>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="camera-file-input"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="gallery-file-input"
      />

      {/* Image Preview or Drop Zone */}
      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-emerald-950/5 max-h-80 flex items-center justify-center">
          <img
            src={selectedImage}
            alt="Field Crop or Soil Preview"
            className="w-full h-auto max-h-72 object-contain rounded-xl"
          />
          <div className="absolute top-3 left-3 bg-emerald-700/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Photo Selected</span>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              className="bg-white/95 hover:bg-white text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatBilingual('Change Photo', 'uploadPhoto', currentLanguage.code)}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Action Buttons: Take Camera Photo or Choose File */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="btn-take-photo"
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-3.5 p-4 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 font-bold transition-all group active:scale-[0.99] text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-emerald-950">
                  {formatBilingual('Take Camera Photo', 'cameraPhoto', currentLanguage.code)}
                </div>
                <div className="text-xs text-emerald-700/90 font-normal mt-0.5">Directly capture infected leaf or soil</div>
              </div>
            </button>

            <button
              id="btn-upload-gallery"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3.5 p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/70 hover:bg-emerald-50/40 text-gray-800 font-bold transition-all group active:scale-[0.99] text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 group-hover:bg-emerald-600 text-gray-700 group-hover:text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-all shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-gray-900">
                  {formatBilingual('Upload Photo', 'uploadPhoto', currentLanguage.code)}
                </div>
                <div className="text-xs text-gray-500 font-normal mt-0.5">Select existing photo from device</div>
              </div>
            </button>
          </div>

          {/* Sample Field Presets for quick evaluation */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {formatBilingual('Or Try Sample Field Photos', 'sampleLeaves', currentLanguage.code)}:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {SAMPLE_FIELD_ITEMS.map((item) => (
                <button
                  key={item.id}
                  id={`sample-item-${item.id}`}
                  type="button"
                  onClick={() => onImageSelected(item.imageUrl, item)}
                  className="group flex flex-col text-left rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-500 bg-white hover:shadow-md transition-all p-1.5"
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${
                      item.category === 'crop' ? 'bg-emerald-700' : 'bg-amber-700'
                    }`}>
                      {item.category === 'crop' 
                        ? formatBilingual('Crop', 'cropTag', currentLanguage.code)
                        : formatBilingual('Soil', 'soilTag', currentLanguage.code)}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-800 line-clamp-1 group-hover:text-emerald-700">
                    <BilingualText text={item.title} langCode={currentLanguage.code} />
                  </div>
                  <div className="text-[10px] text-gray-500 line-clamp-1">
                    <BilingualText text={item.description} langCode={currentLanguage.code} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
