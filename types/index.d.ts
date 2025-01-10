// TODO 이 아래 타입들이 붙어있으면 그냥 아직 몰라서 붙인 타입입니다. 수정이 필요합니다.
declare type UnknownAny = any;
declare type UnknownFunction = (...args: any[]) => any;

declare type Point = {
    x: number;
    y: number;
};

export declare interface ISkeleton {
    executable?: boolean;
    fontSize?: number;
    movable?: boolean;
    readOnly?: boolean;
    nextShadow?: boolean;
    classes?: string[];
    color?: string;
    outerLine?: string;
    morph?: ['prev', 'next']; // for pebble
    dropdownHeight?: number; // for pebble
    path: (blockView: any) => string; // svg path string
    box: (blockView: any) => {
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        marginBottom: number;
        topFieldHeight?: number;
    };
    contentPos: (blockView: any) => Point;
    magnets?: (blockView: any) => {
        next?: Point;
        previous?: Point;
        boolean?: {};
        string?: {};
        param?: {};
    };
    statementPos?: (blockView: any) => Point[];
}

export declare interface MediaUtilsInterface {
    initialize(list?: string[][]): void;

    reset(): void;

    destroy(): void;

    compatabilityChecker(): void; // throws error if failed
}

declare interface EntryDomOptions {
    id?: string;
    class?: string;
    classes?: string[];
    text?: string;
    src?: string;
    href?: string;
    parent?: EntryDom;
}

export declare interface EntryDom extends JQuery {
    innerHTML?: string;
    textContent?: string;
    bindOnClick?: (e: any) => this;
}

export declare type EntryDomConstructor = (
    tag: string | HTMLElement | JQuery,
    options?: EntryDomOptions
) => EntryDom;

export interface HardwareMessageData extends HardwareModuleId {
    [key: string]: any;
}

interface HardwareModuleId {
    company: string;
    model: string;
}

export type WebSocketMessage = {
    data: string;
    mode: number;
    type: 'utf8';
};

declare module SerialPort {}

export declare module IEntry {
    export interface Container {
        resizeEvent: any; // Entry.Event
        splitterEnable?: boolean;

        getAllObjects(): UnknownAny[];
    }

    export interface Playground {
        object?: UnknownAny;
        setMenu?: UnknownFunction;
        resizing: boolean;
        checkVariables: () => void;
        hideTabs: () => void;
        showTabs: () => void;
    }

    export interface Stage {
        loadDialog(dialog: any): void;

        unloadDialog(dialog: any): void;

        canvas: any;
        _app: any;
    }

    /**
     * 과거 엔트리 토스트
     */
    type WSToastFunction = (title: string, message: string, isNotAutoDispose?: boolean) => void;

    export interface WorkspaceToast {
        alert: WSToastFunction;
        warning: WSToastFunction;
        success: WSToastFunction;
        isOpen: (target?: any) => boolean;
    }

    export interface Intro {
        modes: any;
        selected: any;

        generateView(introView: any): void;

        setView(view: any): void;

        removeView(): void;
    }

    // Entry namespace 에 필요한 객체가 있으면 추가해주세요.
}

export declare type EntryBlock = {
    color: string;
    outerLine?: string;
    skeleton: string;
    statements?: any[];
    template?: string;
    params: { [key: string]: any };
    defs?: any; // legacy
    def: { type: string } & { [key: string]: any };
    paramsKeyMap?: { [key: string]: number };
    class: string;
    isFor?: string[];
    isNotFor?: string[];
    events: { [key: string]: any };
    type?: string;
    category?: string;
    pyHelpDef?: {
        params: string[];
        type: string;
    };
    func?: Function;
    syntax?: {
        js?: any[];
        py: any[];
    };
};

// expansion blocks 의 스키마를 따름
export declare interface EntryBlockModule {
    name: string;
    title: { [key: string]: string };
    description?: string;
    getBlocks: () => { [blockName: string]: EntryBlock };
}

export declare interface EntryHardwareBlockModule extends EntryBlockModule {
    // 홍보용
    imageName: string;
    url: string;

    // 모듈 정의용
    id: string | string[];
    monitorTemplate?: UnknownAny;
    communicationType?: string;
    sendMessage?: (hw: import('../src/class/hw').default) => void;
    hasPracticalCourse?: boolean;

    // 필수 함수 목록
    setZero: () => void;
    blockMenuBlocks: string[];
    setLanguage: () => {
        [langType: string]: { [type: string]: { [templateName: string]: string } };
    };

    //TODO afterSend, dataHandler 의 목적이 모호하므로 추후 개선 필요
    afterReceive?: (portData: HardwareMessageData) => void; // 데이터 수신 이후
    afterSend?: (sendQueue: HardwareMessageData) => void; // 데이서 송신 이후
    dataHandler?: (data: HardwareMessageData) => void;
}

export declare interface EntryHWLiteBaseModule extends EntryBlockModule {
    getMonitorPort(): Object;
    duration: number;
    // 홍보용
    imageName: string;
    url: string;

    // 모듈 정의용
    id: string;
    monitorTemplate?: UnknownAny;
    portData?: HWLiteSerialInfo;
    bluetoothInfo?: HWLiteBluetoothInfo;
    type?: 'master' | 'slave';
    delimeter?: string | number;
    webapiType?: 'ble' | 'usb' | 'serial';
    supportFirmwareFlash?: boolean;

    // 필수 함수 목록
    setZero: () => void;
    blockMenuBlocks: string[];
    setLanguage: () => {
        [langType: string]: { [type: string]: { [templateName: string]: string } };
    };
    handleLocalData: (value: any) => void;
    initialHandshake: () => any;
    requestLocalData: () => string;
}

export declare interface HWLiteSerialInfo {
    baudRate: number;
    dataBits: number;
    parity: 'none' | 'even' | 'odd';
    stopBits: 1 | 2;
    bufferSize: number;
    connectionType?: 'bytestream' | 'ascii';
    constantServing?: boolean | 'ReadOnly';
    constantRead?: boolean;
    writeAscii?: boolean;
    readAscii?: boolean;
    flowControl?: 'hardware';
}

export declare interface HWLiteBluetoothInfo {
    filters: BluetoothLEScanFilter[];
    optionalServices: string[];
}

export declare type HWLiteStatus =
    | 'disconnected'
    | 'connected'
    | 'willDisconnect'
    | 'connectFailed';
