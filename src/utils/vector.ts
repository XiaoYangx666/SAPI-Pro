import { Vector3 } from "@minecraft/server";

/**向量工具类，提供向量相关的操作方法 */
export class Vector3Utils {
    /**距离 */
    static distance(v1: Vector3, v2: Vector3): number {
        return Math.sqrt(this.squaredDistance(v1, v2));
    }

    /**距离(不开根号) */
    static squaredDistance(v1: Vector3, v2: Vector3): number {
        return Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2) + Math.pow(v2.z - v1.z, 2);
    }

    /**将Vector3转为数组 */
    static toArray(vector: Vector3): [number, number, number] {
        return [vector.x, vector.y, vector.z];
    }

    /**转为字符串 */
    static toString(vector: Vector3): string {
        return `(${vector.x}, ${vector.y}, ${vector.z})`;
    }

    /**将数组转为Vector3 */
    static fromArray(array: number[]): Vector3 {
        if (array.length !== 3) {
            throw new Error("必须为长度为3的数组");
        }
        if (!array.every(Number.isFinite)) {
            throw new Error("数组必须包含数字");
        }
        return { x: array[0], y: array[1], z: array[2] };
    }

    /**v1+v2 */
    static add(v1: Vector3, v2: Vector3): Vector3 {
        return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
    }

    /**v1-v2 */
    static subtract(v1: Vector3, v2: Vector3): Vector3 {
        return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
    }

    /**v1*n */
    static scale(v: Vector3, times: number) {
        return { x: v.x * times, y: v.y * times, z: v.z * times };
    }

    /**v1==v2? */
    static isEqual(v1: Vector3, v2: Vector3): boolean {
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
    }

    /**v1与v2在误差eps范围内相等? */
    static isApproxEqual(v1: Vector3, v2: Vector3, eps: number = 1e-6): boolean {
        return Math.abs(v1.x - v2.x) < eps && Math.abs(v1.y - v2.y) < eps && Math.abs(v1.z - v2.z) < eps;
    }

    /**向量长度 */
    static length(v: Vector3) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    /**点积 */
    static dot(v1: Vector3, v2: Vector3) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    /**叉积 */
    static cross(v1: Vector3, v2: Vector3) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x,
        };
    }

    /**归一化向量 */
    static normalize(v: Vector3) {
        const len = this.length(v);
        if (len === 0) return { x: 0, y: 0, z: 0 };
        return { x: v.x / len, y: v.y / len, z: v.z / len };
    }

    /**返回上方指定距离(默认1)的Vector */
    static above(v: Vector3, step: number = 1) {
        return this.add(v, { x: 0, y: step, z: 0 });
    }

    /**返回下方指定距离(默认1)的Vector */
    static below(v: Vector3, step: number = 1) {
        return this.subtract(v, { x: 0, y: step, z: 0 });
    }

    /**小数坐标转为整数坐标 */
    static intLoc(v: Vector3) {
        return { x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) };
    }

    static toFixed(v: Vector3, digits: number = 2): Vector3 {
        const factor = Math.pow(10, digits);
        return {
            x: Math.round(v.x * factor) / factor,
            y: Math.round(v.y * factor) / factor,
            z: Math.round(v.z * factor) / factor,
        };
    }
}
