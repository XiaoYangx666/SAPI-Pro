import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    secCallbacks: [] as ((lastsec: number, cursec: number) => void)[],
    worldLoadSubscribe: vi.fn(),
}));

vi.mock("@minecraft/server", () => ({
    world: { afterEvents: { worldLoad: { subscribe: mocks.worldLoadSubscribe } } },
}));

vi.mock("../../src/Event", () => ({
    intervalBus: {
        subscribesec: (callback: (lastsec: number, cursec: number) => void) => {
            mocks.secCallbacks.push(callback);
        },
    },
}));

vi.mock("../../src/func", () => ({ getAllPlayers: vi.fn(() => []) }));
vi.mock("../../src/utils/logger", () => ({ Logger: class { error() {} } }));
vi.mock("../../src/DataBase/DataBase", () => ({ DPDataBase: class {} }));

import { NameDB } from "../../src/DataBase/NameDB";

describe("NameDB automatic update interval", () => {
    beforeEach(() => {
        mocks.secCallbacks.length = 0;
    });

    it("treats the default 60-second interval as 60,000 milliseconds", () => {
        const db = new NameDB();
        const updateAll = vi.spyOn(db, "updateAll").mockImplementation(() => {});
        const publishSec = mocks.secCallbacks[0];

        // 首次秒回调仍立即更新，与修复前行为一致。
        publishSec(99_000, 100_000);
        expect(updateAll).toHaveBeenCalledTimes(1);

        publishSec(100_000, 101_000);
        publishSec(158_999, 159_999);
        expect(updateAll).toHaveBeenCalledTimes(1);

        publishSec(159_000, 160_000);
        expect(updateAll).toHaveBeenCalledTimes(2);

        publishSec(160_000, 161_000);
        expect(updateAll).toHaveBeenCalledTimes(2);
    });

    it("honors custom intervals in seconds and uses the current timestamp", () => {
        const db = new NameDB({ updateInterval: 2 });
        const updateAll = vi.spyOn(db, "updateAll").mockImplementation(() => {});
        const publishSec = mocks.secCallbacks[0];

        publishSec(99_000, 100_000);
        publishSec(100_000, 101_000);
        expect(updateAll).toHaveBeenCalledTimes(1);

        publishSec(101_000, 102_000);
        expect(updateAll).toHaveBeenCalledTimes(2);

        publishSec(102_000, 103_000);
        expect(updateAll).toHaveBeenCalledTimes(2);
    });

    it("does not subscribe when automatic updates are disabled", () => {
        new NameDB({ autoUpdate: false });
        expect(mocks.secCallbacks).toHaveLength(0);
    });
});
