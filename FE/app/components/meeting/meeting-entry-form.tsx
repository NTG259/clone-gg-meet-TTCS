"use client";

import { Button } from "@/components/ui/button";
import { MeetingMode } from "@/types/meeting";

type Props = {
    mode: MeetingMode;
    roomName: string;
    onModeChange: (mode: MeetingMode) => void;
    onRoomNameChange: (value: string) => void;
    onContinue: () => void;
    loading?: boolean;
};

export function MeetingEntryForm({
    mode,
    roomName,
    onModeChange,
    onRoomNameChange,
    onContinue,
    loading = false,
}: Props) {
    return (
        <div className="rounded-2xl border p-6 space-y-4">
            <div className="flex gap-3">
                <Button
                    variant={mode === "create" ? "default" : "outline"}
                    onClick={() => onModeChange("create")}
                >
                    Tạo phòng
                </Button>
                <Button
                    variant={mode === "join" ? "default" : "outline"}
                    onClick={() => onModeChange("join")}
                >
                    Vào phòng
                </Button>
            </div>

            {mode === "join" && (
                <label className="block">
                    <span className="text-sm text-muted-foreground">
                        Nhập mã / tên phòng
                    </span>
                    <input
                        className="mt-2 w-full rounded-xl border px-4 py-3 bg-background"
                        placeholder="vd: ab12cd34"
                        value={roomName}
                        onChange={(e) => onRoomNameChange(e.target.value)}
                    />
                </label>
            )}

            <Button onClick={onContinue} disabled={loading}>
                {mode === "create"
                    ? loading
                        ? "Đang tạo phòng..."
                        : "Tạo phòng mới"
                    : "Tiếp tục vào phòng"}
            </Button>
        </div>
    );
}