import { useEffect, useMemo, useState } from "react";
import { firstResolvedAssetUrl } from "@/utils/assetUrl";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  extraUrls?: Array<string | null | undefined>;
  containerClassName?: string;
  textClassName?: string;
}

function UserAvatar({
  name,
  avatarUrl,
  extraUrls,
  containerClassName,
  textClassName,
}: UserAvatarProps) {
  const resolvedUrl = useMemo(
    () => firstResolvedAssetUrl(avatarUrl, ...(extraUrls || [])),
    [avatarUrl, extraUrls]
  );

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedUrl]);

  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const canRenderImage = Boolean(resolvedUrl) && !imageFailed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white ${containerClassName || "h-10 w-10"}`}
    >
      {canRenderImage ? (
        <img
          src={resolvedUrl}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={textClassName || "text-sm font-bold"}>{initial}</span>
      )}
    </div>
  );
}

export default UserAvatar;
