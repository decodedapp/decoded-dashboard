import React, { useState, useEffect } from "react";
import { networkManager } from "@/network/network";

function SystemConfigAddPage() {
  const [configData, setConfigData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await networkManager.request(
        `admin/${userDocId}/system-configs`,
        "GET",
        null,
        accessToken
      );
      const { _id, ...configWithoutId } = response.data;
      setConfigData(JSON.stringify(configWithoutId, null, 2));
    } catch (error) {
      console.error("시스템 설정을 불러오는데 실패했습니다:", error);
      alert("시스템 설정을 불러오는데 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configData) {
      alert("설정 데이터를 입력해주세요.");
      return;
    }

    let parsedConfig;
    try {
      parsedConfig = JSON.parse(configData);
    } catch (error) {
      alert("올바른 JSON 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const userDocId = sessionStorage.getItem("USER_DOC_ID");
      if (!userDocId) {
        alert("로그인이 필요합니다.");
        return;
      }

      await networkManager.request(
        `admin/${userDocId}/system-configs/update`,
        "PATCH",
        parsedConfig,
        accessToken
      );
      alert("시스템 설정이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("시스템 설정 업데이트 실패:", error);
      alert("시스템 설정 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#222222] shadow rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-400 mb-6">시스템 설정</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              시스템 설정 데이터 (JSON)
            </label>
            <textarea
              value={configData}
              onChange={(e) => setConfigData(e.target.value)}
              placeholder="시스템 설정 데이터를 JSON 형식으로 입력하세요"
              rows={20}
              className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-gray-200 font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#EAFD66] text-black rounded-lg hover:bg-[#dbed5d] disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isLoading ? "처리중..." : "설정 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SystemConfigAddPage;
