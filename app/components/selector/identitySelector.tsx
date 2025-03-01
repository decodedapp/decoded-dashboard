import { useState, useEffect } from "react";
import { IdentityDocument } from "@/types/model";
import { networkManager } from "@/network/network";

interface IdentitySelectorProps {
  index: number;
  docs: IdentityDocument[];
  onIdentitySelect: (
    index: number,
    identityId: string,
    identityName: string
  ) => void;
}

export const IdentitySelector = ({
  index,
  docs,
  onIdentitySelect,
}: IdentitySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [identities, setIdentities] = useState<IdentityDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdentity, setSelectedIdentity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setIdentities(docs);
  }, [docs]);

  const handleSelect = (identityId: string, identityName: string) => {
    setSelectedIdentity({ id: identityId, name: identityName });
    onIdentitySelect(index, identityId, identityName);
    setIsOpen(false);
  };

  const getFilteredIdentities = () => {
    return identities.filter((identity) =>
      identity.name.ko.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="relative text-xs sm:text-sm">
      <input
        type="text"
        placeholder="아이덴티티 검색"
        value={isOpen ? searchQuery : selectedIdentity?.name || ""}
        className="w-full px-3 py-2 rounded-md text-gray-400 bg-[#1A1A1A]"
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && searchQuery && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-md border bg-[#1A1A1A]">
          {getFilteredIdentities().length > 0 ? (
            getFilteredIdentities().map((identity) => (
              <div
                key={identity.id}
                onClick={() => handleSelect(identity.id, identity.name.ko)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-400/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-400">
                    {identity.name.ko}
                  </div>
                  <div className="text-sm text-gray-500">
                    {identity.category}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-500 text-center">
                검색 결과가 없습니다
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
