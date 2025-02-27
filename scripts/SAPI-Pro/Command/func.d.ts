/** 非递归前序遍历 */
export declare function PreOrdertraverse<U>(root: U, options: PreOrdertraverseOptions<U>): any;
/** 遍历选项接口 */
export interface PreOrdertraverseOptions<U> {
    /** 获取子节点的函数 */
    getSubNodes: getSubNodesFunc<U>;
    /** 访问节点时的回调函数 */
    enter: enterNodeFunc<U>;
    /** 上下文对象（可选） */
    ctx?: any;
}
export declare enum traverseAct {
    break = "break",
    back = "back"
}
export type getSubNodesFunc<U> = (node: U) => U[] | undefined;
export type enterNodeFunc<U> = (node: U, ctx: any, stack: [U, number][]) => void | traverseAct;
