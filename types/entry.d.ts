/// <reference path="./index.d.ts" />

import { ISkeleton, EntryBlock, UnknownAny } from './index';

declare interface EntryOptions {
    hardwareEnable?: boolean;
    mediaFilePath?: string;
    moduleBaseUrl?: string;
    moduleliteBaseUrl?: string;
    dataTableDisable?: boolean;
    offlineModulePath?: string;
}

/**
 * 엔트리 실제 인스턴스에 대한 정의
 */
export declare interface IEntry extends EntryOptions {
    soundQueue: any;
    Func: any;
    externalModulesLite: any;
    loadAudio_: (filename: string[], name: string) => void;
    loadLiteTestModule: (file: file, name: string) => Promise<void>;
    loadLiteTestModuleUploader: () => void;
    HWLite: typeof import('../src/class/hw_lite').default;
    HW: typeof import('../src/class/hw').default;
    Intro: typeof import('../src/class/intro').default;
    PropertyPanel: typeof import('../src/class/property_panel').default;
    Pdf: typeof import('../src/class/pdf').default;
    BlockMenu: typeof import('../src/playground/block_menu').default;
    Dom: typeof import('../src/core/dom').default;
    Dialog: typeof import('../src/class/dialog').default;
    popupHelper: typeof import('../src/class/popup_helper').default;
    moduleManager: typeof import('../src/class/entryModuleLoader').default;
    Model: (target: any, isSeal: boolean) => void;
    BlockView: any;
    SVG: any;
    Event: any;
    Code: any;
    BlockMenuScroller: any;

    // 엔트리 내 클래스들
    skeleton: { [name: string]: ISkeleton };
    options: EntryOptions;
    engine: any;
    toast: IEntry.WorkspaceToast;
    playground: IEntry.Playground;
    workspace: any;
    console: any;
    propertyPanel: import('../src/class/property_panel').default;
    container: IEntry.Container;
    stage: IEntry.Stage;
    Utils: any;
    GlobalSvg: any;
    Workspace: any;
    DragInstance: any;

    // 엔트리에서 네임스페이스에 할당되어있는 특정 객체들
    HARDWARE_LIST: { [hardwareName: string]: any };
    HARDWARE_LITE_LIST: { [hardwareName: string]: any };
    KeyboardCode: {
        map: { [keyname: string]: number };
        codeToKeyCode: { [keyname: string]: number };
    };
    events_: any;
    requestUpdate: boolean;
    TEXT_ALIGNS: string[];
    TEXT_ALIGN_LEFT: number;
    TEXT_ALIGN_CENTER: number;
    TEXT_ALIGN_RIGHT: number;
    block: {
        [blockName: string]: EntryBlock;
        changeBlockText: (key: string, text: string) => void;
        changeBlockEvent: (key: string, event: string, callback: Function) => void;
    };
    hwLite: typeof import('../src/class/hw_lite').default;
    hw: import('../src/class/hw').default; // HW instance
    interfaceState: { [key: string]: any };
    modal: any; // @entrylabs/modal

    // 엔트리 전역에 할당된 이벤트 객체
    disposeEvent: any;
    documentMousemove: any;
    keyPressed: any;
    windowResized: any;
    documentMousedown: any;

    // 엔트리 전역에 할당된 상수
    DRAG_MODE_DRAG: 2; // utils.js
    DRAG_MODE_NONE: 0;
    DRAG_MODE_MOUSEDOWN: 1;
    type: 'workspace' | string;

    // 엔트리에서 네임스페이스에 할당되어있는 특정 함수들
    addEventListener(type: string, listener: () => void): void;
    removeEventListener(eventName: string, listener: () => void): void;
    dispatchEvent(eventName: string, ...args: any): void;
    getMainWS(): UnknownAny | undefined;
    isMobile(): boolean;
    assert(predicate: any, message: string): void;
    resizeElement(interfaceModel?: any): void;
    loadExternalModules(project: any): Promise<void>;
    loadLiteExternalModules: (project?: any) => Promise<void>;
    bindAnimationCallbackOnce(element: any, func: () => void): void;
    createElement<K extends keyof HTMLElementTagNameMap>(
        type: HTMLElement | K,
        elementId?: string
    ): HTMLElementTagNameMap[K];
    do(commandName: string, ...args: any[]): any;

    expansionBlocks: any;
    aiUtilizeBlocks: any;
    hardwareLiteBlocks: any;
    generateHash: () => string;

    canvas_: HTMLCanvasElement;
    CANVAS_MIN_WIDTH: 162;
    CANVAS_DEFAULT_WIDTH: 324;
    CANVAS_MAX_WIDTH: 640;
}

declare type IHardwareType = 'serial' | 'bluetooth' | 'hid' | 'ble';
declare type IHardwareControlType = 'slave' | 'master';

declare interface IHardwareModuleConfig {
    type: IHardwareType;
    control: IHardwareControlType;
    duration: number;
    baudRate: number;
    commType: 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'binary' | 'hex' | undefined;
    firmwarecheck?: boolean;

    vendor: string | string[] | { [key in 'win32' | 'darwin']: string | string[] };
    pnpId: string | string[];
    comName: string;

    lostTimer?: number;
    flowControl?: 'hardware' | 'software';
    byteDelimiter?: number[];
    delimiter?: string;

    advertise?: number;
    softwareReset?: boolean;
    stream?: 'string';
}

declare var Entry: IEntry;
