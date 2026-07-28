import { X, UserPlus } from "lucide-react";
import { addFollower, removeFollower } from "@/lib/contacts/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { displayName } from "@/lib/utils";

interface FollowerProfile {
  id: string;
  email: string;
  full_name: string | null;
}

export function FollowersSection({
  contactId,
  followers,
  availableProfiles,
}: {
  contactId: string;
  followers: FollowerProfile[];
  availableProfiles: FollowerProfile[];
}) {
  const followingIds = new Set(followers.map((f) => f.id));
  const candidates = availableProfiles.filter((p) => !followingIds.has(p.id));

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-500">Followers</p>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {followers.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-1 pr-2"
          >
            <Avatar name={displayName(f)} className="h-5 w-5 text-[9px]" />
            <span className="text-xs text-gray-700">{displayName(f)}</span>
            <form action={removeFollower}>
              <input type="hidden" name="contact_id" value={contactId} />
              <input type="hidden" name="user_id" value={f.id} />
              <button
                type="submit"
                className="text-gray-400 hover:text-red-600"
                aria-label="Remove follower"
              >
                <X size={12} />
              </button>
            </form>
          </div>
        ))}
        {followers.length === 0 && (
          <span className="text-xs text-gray-400">No followers yet.</span>
        )}
      </div>

      {candidates.length > 0 && (
        <form action={addFollower} className="flex items-center gap-2">
          <input type="hidden" name="contact_id" value={contactId} />
          <Select name="user_id" defaultValue="" className="h-8 py-1 text-xs">
            <option value="">Add a follower…</option>
            {candidates.map((p) => (
              <option key={p.id} value={p.id}>
                {displayName(p)}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" className="h-8 py-1 text-xs">
            <UserPlus size={12} />
          </Button>
        </form>
      )}
    </div>
  );
}
