import singleInstance from '../core/singleInstance';
import { GEHelper } from '../graphicEngine/GEHelper';
import {
    FilesetResolver,
    DrawingUtils,
    GestureRecognizer,
    GestureRecognizerResult,
    PoseLandmarker,
    PoseLandmarkerResult,
    ObjectDetector,
    ObjectDetectorResult,
    Detection,
} from '@mediapipe/tasks-vision';
import { UAParser } from 'ua-parser-js';
import _clamp from 'lodash/clamp';
import _get from 'lodash/get';
import VideoMotionWorker from './workers/newmotion.worker.ts';

export const getInputList = async () => {
    if (navigator.mediaDevices) {
        return (await navigator.mediaDevices.enumerateDevices()) || [];
    }
    return [];
};

const parser = new UAParser();

export const flipState = {
    NORMAL: 0,
    HORIZONTAL: 1,
    VERTICAL: 2,
    BOTH: 3,
};
type FLIP_NORMAL = 0;
type FLIP_HORIZONTAL = 1;
type FLIP_VERTICAL = 2;
type FLIP_BOTH = 3;
type TFlipState = FLIP_NORMAL | FLIP_HORIZONTAL | FLIP_VERTICAL | FLIP_BOTH;

type TGestureRecognitionOption = {
    isDrawDetectedHand?: boolean;
};

type MotionElement = {
    total: number;
    direction: {
        x: number;
        y: number;
    };
};

type Pixel = {
    r: number;
    g: number;
    b: number;
    rDiff: number;
    gDiff: number;
    bDiff: number;
};

type TNames = {
    [key: string]: string;
};

const flipActions = {
    [flipState.NORMAL]: {
        [flipState.HORIZONTAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
        },
        [flipState.VERTICAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.BOTH]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
            GEHelper.vFlipVideoElement(videos);
        },
    },
    [flipState.HORIZONTAL]: {
        [flipState.NORMAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
        },
        [flipState.VERTICAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.BOTH]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.vFlipVideoElement(videos);
        },
    },
    [flipState.VERTICAL]: {
        [flipState.NORMAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.HORIZONTAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.BOTH]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
        },
    },
    [flipState.BOTH]: {
        [flipState.NORMAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.HORIZONTAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.vFlipVideoElement(videos);
        },
        [flipState.VERTICAL]: (videos: PIXI.Sprite[] | createjs.Bitmap[]) => {
            GEHelper.hFlipVideoElement(videos);
        },
    },
};

const colors = [
    'rgb(66, 133, 244)',
    'rgb(36, 193, 224)',
    'rgb(52, 168, 83)',
    'rgb(161, 66, 244)',
    'rgb(244, 57, 160)',
    'rgb(234, 67, 53)',
    'rgb(250, 123, 23)',
    'rgb(252, 201, 52)',
];

class MediaPipeUtils {
    public isInitialized: boolean = false;
    public videoInputList: string[][] = [];
    public canvasVideo: PIXI.Sprite | createjs.Bitmap;
    public video: HTMLVideoElement;
    public videoCanvas: HTMLCanvasElement;
    public videoCanvasCtx: CanvasRenderingContext2D;
    public motionCanvas: HTMLCanvasElement;
    public motionOffscreenCanvas: HTMLCanvasElement;
    public canWorker: boolean = true;
    public flipState: TFlipState = 0;
    private VIDEO_WIDTH: number = 640;
    private VIDEO_HEIGHT: number = 360;
    private STAGE_WIDTH: number = 480;
    private STAGE_HEIGHT: number = 260;
    private SAMPLE_SIZE: number = 15;
    private stream: MediaStream;
    private lastVideoTime: number = -1;
    private sourceTarget: number;

    public countDetectedHand: number;
    public isPrevHandDetected: boolean = false;
    public isRunningHandGesture: boolean = false;
    public isDrawDetectedHand: boolean = false;
    private isInitGestureRecognition: boolean = false;
    private gestureRecognizerVideoCanvas: HTMLCanvasElement;
    private gestureRecognizerVideoCanvasCtx: CanvasRenderingContext2D;
    private gestureRecognizerCanvasOverlay: PIXI.Sprite | createjs.Bitmap;
    private gestureRecognizerOffscreenCanvas: OffscreenCanvas;
    private gestureRecognizerWorker: Worker;
    private alreadyInitGestureRecognizerOffscreenCanvas: boolean = false;
    private gestureRecognizerDrawingUtils: DrawingUtils;
    private prevGestureRecognizerResult: GestureRecognizerResult;
    private gestureRecognizer: GestureRecognizer;

    public countDetectedPose: number;
    public isPrevPoseLandmarker: boolean = false;
    public isRunningPoseLandmarker: boolean = false;
    public isDrawDetectedPoseLandmarker: boolean = false;
    private isInitPoseLandmarker: boolean = false;
    private poseLandmarkerVideoCanvas: HTMLCanvasElement;
    private poseLandmarkerVideoCanvasCtx: CanvasRenderingContext2D;
    private poseLandmarkerCanvasOverlay: PIXI.Sprite | createjs.Bitmap;
    private poseLandmarkerOffscreenCanvas: OffscreenCanvas;
    private poseLandmarkerWorker: Worker;
    private alreadyInitPoseLandmarkerOffscreenCanvas: boolean = false;
    private poseLandmarkerDrawingUtils: DrawingUtils;
    private prevPoseLandmarkerResult: PoseLandmarkerResult;
    private poseLandmarker: PoseLandmarker;

    public countDetectedFace: number;
    public isPrevFaceLandmarker: boolean = false;
    public isRunWorkerFaceLandmarker: boolean = false;
    public isRunningFaceLandmarker: boolean = false;
    public isDrawDetectedFaceLandmarker: boolean = false;
    private isInitFaceLandmarker: boolean = false;
    private faceLandmarkerVideoCanvas: HTMLCanvasElement;
    private faceLandmarkerCanvasOverlay: PIXI.Sprite | createjs.Bitmap;
    private faceLandmarkerOffscreenCanvas: OffscreenCanvas;
    private faceLandmarkerWorker: Worker;
    private alreadyInitFaceLandmarkerOffscreenCanvas: boolean = false;
    private prevFaceLandmarkerResult: any;

    public countDetectedObject: number;
    public isPrevObjectDetector: boolean = false;
    public isRunningObjectDetector: boolean = false;
    public isDrawDetectedObjectDetector: boolean = false;
    private isInitObjectDetector: boolean = false;
    private objectDetectorVideoCanvas: HTMLCanvasElement;
    private objectDetectorVideoCanvasCtx: CanvasRenderingContext2D;
    private objectDetectorCanvasOverlay: PIXI.Sprite | createjs.Bitmap;
    private objectDetectorOffscreenCanvas: OffscreenCanvas;
    private objectDetectorWorker: Worker;
    private alreadyInitObjectDetectorOffscreenCanvas: boolean = false;
    private prevObjectDetectorResult: ObjectDetectorResult;
    private objectDetector: ObjectDetector;

    public totalMotions: MotionElement = { total: 0, direction: { x: 0, y: 0 } };
    public motions: Pixel[][] = [
        ...Array(Math.ceil(this.STAGE_HEIGHT / this.SAMPLE_SIZE)),
    ].map((e) => Array(this.STAGE_WIDTH / this.SAMPLE_SIZE));
    public motionWorker: Worker = new VideoMotionWorker();

    constructor() {
        const uaResult = parser.getResult();
        if (uaResult.browser.name === 'Safari' || uaResult.os.name === 'iOS') {
            this.canWorker = false;
        }
    }

    get isRunning() {
        return Boolean(this.video.srcObject);
    }

    get allCanvases(): PIXI.Sprite[] | createjs.Bitmap[] {
        return [
            this.canvasVideo,
            this.gestureRecognizerCanvasOverlay,
            this.poseLandmarkerCanvasOverlay,
            this.faceLandmarkerCanvasOverlay,
            this.objectDetectorCanvasOverlay,
        ] as PIXI.Sprite[] | createjs.Bitmap[];
    }

    get overlayCanvases(): PIXI.Sprite[] | createjs.Bitmap[] {
        return [
            this.gestureRecognizerCanvasOverlay,
            this.poseLandmarkerCanvasOverlay,
            this.faceLandmarkerCanvasOverlay,
            this.objectDetectorCanvasOverlay,
        ] as PIXI.Sprite[] | createjs.Bitmap[];
    }

    changeCanWorker(canWorker: boolean) {
        this.canWorker = canWorker;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        await this.checkPermission();
        const inputList = await getInputList();
        this.videoInputList = inputList
            .filter((input) => input.kind === 'videoinput' && input.deviceId)
            .map((item) => [item.label, item.deviceId]);

        await this.compatabilityChecker();
        this.motionCanvas = document.createElement('canvas');
        this.motionCanvas.width = this.VIDEO_WIDTH;
        this.motionCanvas.height = this.VIDEO_HEIGHT;
        const video = document.createElement('video');
        video.id = 'webCamElement';
        video.autoplay = true;
        video.width = this.VIDEO_WIDTH;
        video.height = this.VIDEO_HEIGHT;
        this.canvasVideo = GEHelper.getVideoElement(video);
        GEHelper.hFlipVideoElement(this.allCanvases as PIXI.Sprite[] | createjs.Bitmap[]);
        this.video = video;
        Entry.addEventListener('beforeStop', this.reset.bind(this));
        this.isInitialized = true;
        this.initMotionWorkerEvent();
    }

    sleep(ms?: number) {
        return new Promise((resolve) => {
            if (ms) {
                setTimeout(resolve, ms);
            } else {
                requestAnimationFrame(resolve);
            }
        });
    }

    initMotionWorkerEvent() {
        this.motionWorker.onmessage = ({ data }) => {
            if (data.action === 'init_complete') {
                this.motionDetect();
            } else if (data.action === 'next_detect_motion') {
                this.totalMotions = data.result;
                setTimeout(this.motionDetect.bind(this), 100);
            }
        };
    }

    cameraOnOff(mode: String) {
        if (mode === 'on') {
            this.turnOnWebcam();
        } else {
            this.turnOffWebcam();
        }
    }

    async changeSource(target: number) {
        const inputSource = this.videoInputList[target];
        if (!inputSource) {
            return;
        }
        this.sourceTarget = target;
        try {
            this.stream = await this.getVideoStream(inputSource[1]);
            this.video.srcObject = this.stream;
            this.video.width = this.VIDEO_WIDTH;
            this.video.height = this.VIDEO_HEIGHT;
            this.video.style.transform = 'scaleX(-1)';
        } catch (err) {
            console.log(err);
        }
    }

    setFlipState(state: TFlipState) {
        if (!this.canvasVideo) {
            return;
        }
        this.setForceFlipState(this.flipState, state);
    }

    setForceFlipState(prevState: TFlipState, nextState: TFlipState) {
        const action = flipActions[prevState][nextState];
        if (action) {
            action(this.allCanvases);
        }
        this.flipState = nextState;
    }

    initFlipStateCanvas(canvas: PIXI.Sprite | createjs.Bitmap) {
        if (this.flipState === 0) {
            GEHelper.hFlipVideoElement(canvas);
        } else if (this.flipState === 2) {
            GEHelper.vFlipVideoElement(canvas);
            GEHelper.hFlipVideoElement(canvas);
        } else if (this.flipState === 3) {
            GEHelper.vFlipVideoElement(canvas);
        }
    }

    setOpacityCamera(opacity: number) {
        GEHelper.setVideoAlpha(this.canvasVideo, opacity);
    }

    turnOffWebcam() {
        if (this.video.srcObject) {
            const stream: MediaStream = this.video.srcObject as MediaStream;
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            window.requestAnimationFrame(() => {
                this.video.srcObject = null;
                this.stream = undefined;
            });
        }

        GEHelper.turnOffWebcam(this.canvasVideo);
        this.overlayCanvases.forEach((canvas: PIXI.Sprite | createjs.Bitmap) => {
            if (canvas) {
                GEHelper.turnOffOverlay(canvas);
            }
        });
        this.setForceFlipState(this.flipState, 0);
    }

    async getVideoStream(source: string) {
        const isMobile = typeof window.orientation !== 'undefined';
        const isPortrait = isMobile && window.screen.orientation.type.includes('portrait');
        const width = isPortrait ? this.VIDEO_HEIGHT : this.VIDEO_WIDTH;
        const height = isPortrait ? this.VIDEO_WIDTH : this.VIDEO_HEIGHT;
        return await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: source },
                width,
                height,
            },
        });
    }

    registerRotateEvent = () => {
        const isMobile = typeof window.orientation !== 'undefined';
        const reloadVideo = async () => {
            if (this.video.srcObject) {
                const stream: MediaStream = this.video.srcObject as MediaStream;
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }

            const target = this.sourceTarget || 0;
            const stream = await this.getVideoStream(this.videoInputList[target][1]);
            this.video.srcObject = stream;
            this.stream = stream;
        };
        if (isMobile && !window.screen.orientation.onchange) {
            window.screen.orientation.onchange = reloadVideo;
        }
    }

    async turnOnWebcam() {
        let stream;
        try {
            const target = this.sourceTarget || 0;
            stream = await this.getVideoStream(this.videoInputList[target][1]);
        } catch (err) {
            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                Lang.Workspace.check_webcam_error,
            ]);
        }
        this.video.srcObject = stream;
        this.stream = stream;
        try {
            await this.video.play();
            this.registerRotateEvent();
        } catch {}
        GEHelper.drawVideoElement(this.canvasVideo);
        this.overlayCanvases.forEach((canvas: PIXI.Sprite | createjs.Bitmap) => {
            if (canvas) {
                GEHelper.drawOverlayElement(canvas);
            }
        });
        this.motionWorker.postMessage({
            action: 'init',
            width: this.VIDEO_WIDTH,
            height: this.VIDEO_HEIGHT,
        });
    }

    async checkPermission() {
        if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'camera' });
            if (permission.state !== 'granted') {
                await navigator.mediaDevices.getUserMedia({ video: true });
            }
        } else {
            await navigator.mediaDevices.getUserMedia({ video: true });
        }
    }

    async compatabilityChecker() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                Lang.Workspace.check_browser_error_video,
            ]);
        }
        if (!this.stream && this.videoInputList.length == 0) {
            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                Lang.Workspace.check_webcam_error,
            ]);
        }
    }

    isFlipState(type: string) {
        if (type === 'horizontal') {
            return this.flipState === flipState.BOTH || this.flipState === flipState.HORIZONTAL;
        } else if (type === 'vertical') {
            return this.flipState === flipState.BOTH || this.flipState === flipState.VERTICAL;
        }
    }

    motionDetect(sprite?: any): Promise<MotionElement> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.motionCanvas || !this.isRunning) {
                    resolve(undefined);
                    return;
                }
                if (this.video.readyState < 2) {
                    await this.sleep();
                    resolve(this.motionDetect(sprite));
                    return;
                }

                const id = Entry.generateHash();
                if (sprite) {
                    const returnMessage = ({ data }: MessageEvent) => {
                        if (data.action === 'sprite_return' && data.id === id) {
                            this.motionWorker.removeEventListener('message', returnMessage);
                            resolve(data.result);
                        }
                    };
                    this.motionWorker.addEventListener('message', returnMessage);
                }
                const { STAGE_WIDTH: width, STAGE_HEIGHT: height, SAMPLE_SIZE: sampleSize } = this;
                const [minX, maxX] = [0, width];
                const [minY, maxY] = [0, height];
                const imageBitmap = await createImageBitmap(this.video);
                this.motionWorker.postMessage({
                    sprite: sprite && {
                        x: sprite.x,
                        y: sprite.y,
                        width: sprite.width,
                        height: sprite.height,
                        scaleX: sprite.scaleX,
                        scaleY: sprite.scaleY,
                    },
                    action: 'motion',
                    range: {
                        minX,
                        maxX,
                        minY,
                        maxY,
                    },
                    imageBitmap,
                    flipState: this.flipState,
                    id,
                });

                if (!sprite) {
                    resolve(undefined);
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    getYX(a: number) {
        return Math.max(1, Math.min(10, 10 * (1 - (a - -0.15) / 0.25) + (1 - (0.1 - a) / 0.25)));
    }

    async sendImageBitmapForGesture() {
        if (!this.isRunningHandGesture) {
            return;
        }
        if (this.video.readyState < 2) {
            await this.sleep();
            this.sendImageBitmapForGesture();
            return;
        }
        this.gestureRecognizerWorker.postMessage({
            action: 'gesture_recognizer',
            imageBitmap: await createImageBitmap(this.video),
            flipState: this.flipState,
        });
    }

    async sendImageBitmapForPoseLandmarker() {
        if (!this.isRunningPoseLandmarker) {
            return;
        }
        if (this.video.readyState < 2) {
            await this.sleep();
            this.sendImageBitmapForPoseLandmarker();
            return;
        }
        this.poseLandmarkerWorker.postMessage({
            action: 'pose_landmarker',
            imageBitmap: await createImageBitmap(this.video),
            flipState: this.flipState,
        });
    }

    async sendImageBitmapForFaceLandmarker() {
        if (!this.isRunningFaceLandmarker) {
            return;
        }
        if (this.video.readyState < 2) {
            await this.sleep();
            this.sendImageBitmapForFaceLandmarker();
            return;
        }
        this.faceLandmarkerWorker.postMessage({
            action: 'face_landmarker',
            imageBitmap: await createImageBitmap(this.video),
            flipState: this.flipState,
        });
    }

    async sendImageBitmapForObjectDetector() {
        if (!this.isRunningObjectDetector) {
            return;
        }
        if (this.video.readyState < 2) {
            await this.sleep();
            this.sendImageBitmapForObjectDetector();
            return;
        }
        this.objectDetectorWorker.postMessage({
            action: 'object_detector',
            imageBitmap: await createImageBitmap(this.video),
            flipState: this.flipState,
        });
    }

    initGestureRecognitionWorkerEvent() {
        this.gestureRecognizerWorker.addEventListener('message', ({ data }) => {
            if (!this.isRunningHandGesture) {
                return;
            }
            if (['next_gesture_recognizer'].includes(data.action)) {
                if (GEHelper.isWebGL) {
                    (this.gestureRecognizerCanvasOverlay as PIXI.Sprite).texture.update();
                }
                this.sendImageBitmapForGesture();
            } else if (data.action === 'start_gesture_recognizer') {
                this.isPrevHandDetected = true;
                Entry.engine.fireEvent('when_hand_detection');
            } else if (data.action === 'stop_gesture_recognizer') {
                this.countDetectedHand = 0;
                this.isPrevHandDetected = false;
            } else if (data.action === 'count_detected_hand_gesture_recognizer') {
                this.countDetectedHand = data.count;
            } else if (data.action === 'gesture_recognizer_data') {
                this.prevGestureRecognizerResult = data.gestureRecognizerResult;
            }
        });
    }

    initPoseLandmarkerWorkerEvent() {
        this.poseLandmarkerWorker.addEventListener('message', ({ data }) => {
            if (!this.isRunningPoseLandmarker) {
                return;
            }
            if (['next_pose_landmarker'].includes(data.action)) {
                if (GEHelper.isWebGL) {
                    (this.poseLandmarkerCanvasOverlay as PIXI.Sprite).texture.update();
                }
                this.sendImageBitmapForPoseLandmarker();
            } else if (data.action === 'start_pose_landmarker') {
                this.isPrevPoseLandmarker = true;
                Entry.engine.fireEvent('when_pose_landmarker');
            } else if (data.action === 'stop_pose_landmarker') {
                this.countDetectedPose = 0;
                this.isPrevPoseLandmarker = false;
            } else if (data.action === 'count_detected_pose_landmarker') {
                this.countDetectedPose = data.count;
            } else if (data.action === 'pose_landmarker_data') {
                this.prevPoseLandmarkerResult = data.poseLandmarkerResult;
            }
        });
    }

    initFaceLandmarkerWorkerEvent() {
        this.faceLandmarkerWorker.addEventListener('message', ({ data }) => {
            if (!this.isRunningFaceLandmarker) {
                return;
            }
            if (['next_face_landmarker'].includes(data.action)) {
                if (GEHelper.isWebGL) {
                    (this.faceLandmarkerCanvasOverlay as PIXI.Sprite).texture.update();
                }
                this.sendImageBitmapForFaceLandmarker();
            } else if (data.action === 'run_start_face_landmarker') {
                this.isRunWorkerFaceLandmarker = true;
            } else if (data.action === 'run_stop_face_landmarker') {
                this.isRunWorkerFaceLandmarker = false;
            } else if (data.action === 'start_face_landmarker') {
                this.isPrevFaceLandmarker = true;
                Entry.engine.fireEvent('when_face_landmarker');
            } else if (data.action === 'stop_face_landmarker') {
                this.countDetectedFace = 0;
                this.isPrevFaceLandmarker = false;
            } else if (data.action === 'count_detected_face_landmarker') {
                this.countDetectedFace = data.count;
            } else if (data.action === 'face_landmarker_data') {
                this.prevFaceLandmarkerResult = data.faceLandmarkerResult;
            }
        });
    }

    initObjectDetectorWorkerEvent() {
        this.objectDetectorWorker.addEventListener('message', ({ data }) => {
            if (!this.isRunningObjectDetector) {
                return;
            }
            if (['next_object_detector'].includes(data.action)) {
                if (GEHelper.isWebGL) {
                    (this.objectDetectorCanvasOverlay as PIXI.Sprite).texture.update();
                }
                this.sendImageBitmapForObjectDetector();
            } else if (data.action === 'start_object_detector') {
                this.isPrevObjectDetector = true;
                Entry.engine.fireEvent('when_object_detector');
            } else if (data.action === 'stop_object_detector') {
                this.countDetectedObject = 0;
                this.isPrevObjectDetector = false;
            } else if (data.action === 'count_detected_object_detector') {
                this.countDetectedObject = data.count;
            } else if (data.action === 'object_detector_data') {
                this.prevObjectDetectorResult = data.objectDetectorResult;
            }
        });
    }

    initHandGestureRecognition() {
        this.isInitGestureRecognition = true;
        this.gestureRecognizerVideoCanvas = document.createElement('canvas');
        this.gestureRecognizerVideoCanvas.width = this.VIDEO_WIDTH;
        this.gestureRecognizerVideoCanvas.height = this.VIDEO_HEIGHT;
        this.gestureRecognizerCanvasOverlay = GEHelper.getOverlayElement(
            this.gestureRecognizerVideoCanvas
        );
        GEHelper.drawOverlayElement(this.gestureRecognizerCanvasOverlay);
        this.initFlipStateCanvas(this.gestureRecognizerCanvasOverlay);
        if (this.canWorker) {
            // eslint-disable-next-line max-len
            this.gestureRecognizerOffscreenCanvas = this.gestureRecognizerVideoCanvas.transferControlToOffscreen();
            this.gestureRecognizerWorker = new Worker(
                `${Entry.Utils.getEntryjsPath()}/extern/gesture-recognition.worker.js`
            );
            this.initGestureRecognitionWorkerEvent();
        } else {
            this.gestureRecognizerVideoCanvasCtx = this.gestureRecognizerVideoCanvas.getContext(
                '2d'
            );
            this.gestureRecognizerVideoCanvasCtx.font = '20px Arial';
            this.gestureRecognizerDrawingUtils = new DrawingUtils(
                this.gestureRecognizerVideoCanvasCtx
            );
        }
    }

    initPoseLandmarker() {
        this.isInitPoseLandmarker = true;
        this.poseLandmarkerVideoCanvas = document.createElement('canvas');
        this.poseLandmarkerVideoCanvas.width = this.VIDEO_WIDTH;
        this.poseLandmarkerVideoCanvas.height = this.VIDEO_HEIGHT;
        this.poseLandmarkerCanvasOverlay = GEHelper.getOverlayElement(
            this.poseLandmarkerVideoCanvas
        );
        GEHelper.drawOverlayElement(this.poseLandmarkerCanvasOverlay);
        this.initFlipStateCanvas(this.poseLandmarkerCanvasOverlay);
        if (this.canWorker) {
            // eslint-disable-next-line max-len
            this.poseLandmarkerOffscreenCanvas = this.poseLandmarkerVideoCanvas.transferControlToOffscreen();
            this.poseLandmarkerWorker = new Worker(
                `${Entry.Utils.getEntryjsPath()}/extern/pose-landmarker.worker.js`
            );
            this.initPoseLandmarkerWorkerEvent();
        } else {
            this.poseLandmarkerVideoCanvasCtx = this.poseLandmarkerVideoCanvas.getContext('2d');
            this.poseLandmarkerVideoCanvasCtx.font = '20px Arial';
            this.poseLandmarkerDrawingUtils = new DrawingUtils(this.poseLandmarkerVideoCanvasCtx);
        }
    }

    initFaceLandmarker() {
        this.isInitFaceLandmarker = true;
        this.faceLandmarkerVideoCanvas = document.createElement('canvas');
        this.faceLandmarkerVideoCanvas.width = this.VIDEO_WIDTH;
        this.faceLandmarkerVideoCanvas.height = this.VIDEO_HEIGHT;
        this.faceLandmarkerCanvasOverlay = GEHelper.getOverlayElement(
            this.faceLandmarkerVideoCanvas
        );
        GEHelper.drawOverlayElement(this.faceLandmarkerCanvasOverlay);
        this.initFlipStateCanvas(this.faceLandmarkerCanvasOverlay);
        // eslint-disable-next-line max-len
        this.faceLandmarkerOffscreenCanvas = this.faceLandmarkerVideoCanvas.transferControlToOffscreen();
        this.faceLandmarkerWorker = new Worker(
            `${Entry.Utils.getEntryjsPath()}/extern/face-landmarker.worker.js`
        );
        this.initFaceLandmarkerWorkerEvent();
    }

    initObjectDetector() {
        this.isInitObjectDetector = true;
        this.objectDetectorVideoCanvas = document.createElement('canvas');
        this.objectDetectorVideoCanvas.width = this.VIDEO_WIDTH;
        this.objectDetectorVideoCanvas.height = this.VIDEO_HEIGHT;
        this.objectDetectorCanvasOverlay = GEHelper.getOverlayElement(
            this.objectDetectorVideoCanvas
        );
        GEHelper.drawOverlayElement(this.objectDetectorCanvasOverlay);
        this.initFlipStateCanvas(this.objectDetectorCanvasOverlay);
        if (this.canWorker) {
            // eslint-disable-next-line max-len
            this.objectDetectorOffscreenCanvas = this.objectDetectorVideoCanvas.transferControlToOffscreen();
            this.objectDetectorWorker = new Worker(
                `${Entry.Utils.getEntryjsPath()}/extern/object-detector.worker.js`
            );
            this.initObjectDetectorWorkerEvent();
        } else {
            this.objectDetectorVideoCanvasCtx = this.objectDetectorVideoCanvas.getContext('2d');
            this.objectDetectorVideoCanvasCtx.font = '20px Arial';
        }
    }

    async startHandGestureRecognition() {
        try {
            if (!this.stream) {
                await this.turnOnWebcam();
            }
            if (!this.isInitGestureRecognition) {
                this.initHandGestureRecognition();
            }
            this.isRunningHandGesture = true;

            if (this.canWorker) {
                if (!this.alreadyInitGestureRecognizerOffscreenCanvas) {
                    this.gestureRecognizerWorker.postMessage(
                        {
                            action: 'gesture_recognizer_init',
                            canvas: this.gestureRecognizerOffscreenCanvas,
                            lang: {
                                leftHand: Lang.Blocks.left_hand,
                                rightHand: Lang.Blocks.right_hand,
                            },
                            option: {
                                isDrawDetectedHand: this.isDrawDetectedHand,
                            },
                        },
                        [this.gestureRecognizerOffscreenCanvas]
                    );
                    this.alreadyInitGestureRecognizerOffscreenCanvas = true;
                } else {
                    this.gestureRecognizerWorker.postMessage({
                        action: 'gesture_recognizer_restart',
                    });
                    this.sendImageBitmapForGesture();
                }
            } else {
                await this.initPredictHandGesture();
                this.predictHandGesture();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async startPoseLandmarker() {
        try {
            if (!this.stream) {
                await this.turnOnWebcam();
            }
            if (!this.isInitPoseLandmarker) {
                this.initPoseLandmarker();
            }
            this.isRunningPoseLandmarker = true;

            if (this.canWorker) {
                if (!this.alreadyInitPoseLandmarkerOffscreenCanvas) {
                    this.poseLandmarkerWorker.postMessage(
                        {
                            action: 'pose_landmarker_init',
                            canvas: this.poseLandmarkerOffscreenCanvas,
                            lang: {
                                person: Lang.video_object_params.person,
                            },
                            option: {
                                isDrawDetectedPoseLandmarker: this.isDrawDetectedPoseLandmarker,
                            },
                        },
                        [this.poseLandmarkerOffscreenCanvas]
                    );
                    this.alreadyInitPoseLandmarkerOffscreenCanvas = true;
                } else {
                    this.poseLandmarkerWorker.postMessage({
                        action: 'pose_landmarker_restart',
                    });
                    this.sendImageBitmapForPoseLandmarker();
                }
            } else {
                await this.initPredictPoseLandmarker();
                this.predictPoseLandmarker();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async startFaceLandmarker() {
        try {
            if (!this.stream) {
                await this.turnOnWebcam();
            }
            if (!this.isInitFaceLandmarker) {
                this.initFaceLandmarker();
            }
            this.isRunningFaceLandmarker = true;

            if (!this.alreadyInitFaceLandmarkerOffscreenCanvas) {
                const uaResult = parser.getResult();
                this.faceLandmarkerWorker.postMessage(
                    {
                        action: 'face_landmarker_init',
                        canvas: this.faceLandmarkerOffscreenCanvas,
                        isSafari: uaResult.browser.name === 'Safari' || uaResult.os.name === 'iOS',
                        lang: {
                            face: Lang.Blocks.video_face,
                        },
                        option: {
                            isDrawDetectedFaceLandmarker: this.isDrawDetectedFaceLandmarker,
                        },
                    },
                    [this.faceLandmarkerOffscreenCanvas]
                );
                this.alreadyInitFaceLandmarkerOffscreenCanvas = true;
            } else if (!this.isRunWorkerFaceLandmarker) {
                this.faceLandmarkerWorker.postMessage({
                    action: 'face_landmarker_restart',
                });
                this.sendImageBitmapForFaceLandmarker();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async startObjectDetector() {
        try {
            if (!this.stream) {
                await this.turnOnWebcam();
            }
            if (!this.isInitObjectDetector) {
                this.initObjectDetector();
            }
            this.isRunningObjectDetector = true;

            if (this.canWorker) {
                if (!this.alreadyInitObjectDetectorOffscreenCanvas) {
                    this.objectDetectorWorker.postMessage(
                        {
                            action: 'object_detector_init',
                            canvas: this.objectDetectorOffscreenCanvas,
                            lang: {
                                objectNameList: Lang.video_object_params,
                            },
                            option: {
                                isDrawDetectedObjectDetector: this.isDrawDetectedObjectDetector,
                            },
                        },
                        [this.objectDetectorOffscreenCanvas]
                    );
                    this.alreadyInitObjectDetectorOffscreenCanvas = true;
                } else {
                    this.objectDetectorWorker.postMessage({
                        action: 'object_detector_restart',
                    });
                    this.sendImageBitmapForObjectDetector();
                }
            } else {
                await this.initPredictObjectDetector();
                this.predictObjectDetector();
            }
        } catch (e) {
            console.error(e);
        }
    }

    changeDrawDetectedHand(isDrawDetectedHand: boolean) {
        this.isDrawDetectedHand = isDrawDetectedHand;
        this.updateHandGestureRecognition();
    }

    changeDrawDetectedPoseLandmarker(isDrawDetectedPoseLandmarker: boolean) {
        this.isDrawDetectedPoseLandmarker = isDrawDetectedPoseLandmarker;
        this.updatePoseLandmarker();
    }

    changeDrawDetectedFaceLandmarker(isDrawDetectedFaceLandmarker: boolean) {
        this.isDrawDetectedFaceLandmarker = isDrawDetectedFaceLandmarker;
        this.updateFaceLandmarker();
    }

    changeDrawDetectedObjectDetector(isDrawDetectedObjectDetector: boolean) {
        this.isDrawDetectedObjectDetector = isDrawDetectedObjectDetector;
        this.updateObjectDetector();
    }

    updateHandGestureRecognition() {
        if (this.canWorker) {
            this.gestureRecognizerWorker.postMessage({
                action: 'gesture_recognizer_change_option',
                option: {
                    isDrawDetectedHand: this.isDrawDetectedHand,
                },
            });
        }
    }

    updatePoseLandmarker() {
        if (this.canWorker) {
            this.poseLandmarkerWorker.postMessage({
                action: 'pose_landmarker_change_option',
                option: {
                    isDrawDetectedPoseLandmarker: this.isDrawDetectedPoseLandmarker,
                },
            });
        }
    }

    updateFaceLandmarker() {
        this.faceLandmarkerWorker.postMessage({
            action: 'face_landmarker_change_option',
            option: {
                isDrawDetectedFaceLandmarker: this.isDrawDetectedFaceLandmarker,
            },
        });
    }

    updateObjectDetector() {
        if (this.canWorker) {
            this.objectDetectorWorker.postMessage({
                action: 'object_detector_change_option',
                option: {
                    isDrawDetectedObjectDetector: this.isDrawDetectedObjectDetector,
                },
            });
        }
    }

    async stopHandGestureRecognition() {
        if (this.canWorker) {
            this.gestureRecognizerWorker.postMessage({
                action: 'clear_gesture_recognizer',
            });
        } else {
            this.gestureRecognizerVideoCanvasCtx.clearRect(
                0,
                0,
                this.video.width,
                this.video.height
            );
            if (GEHelper.isWebGL) {
                (this.gestureRecognizerCanvasOverlay as PIXI.Sprite).texture.update();
            }
        }
        this.isRunningHandGesture = false;
        this.isPrevHandDetected = false;
        this.countDetectedHand = 0;
    }

    async stopPoseLandmarker() {
        if (this.canWorker) {
            this.poseLandmarkerWorker.postMessage({
                action: 'clear_pose_landmarker',
            });
        } else {
            this.poseLandmarkerVideoCanvasCtx.clearRect(0, 0, this.video.width, this.video.height);
            if (GEHelper.isWebGL) {
                (this.poseLandmarkerCanvasOverlay as PIXI.Sprite).texture.update();
            }
        }
        this.isRunningPoseLandmarker = false;
        this.isPrevPoseLandmarker = false;
        this.countDetectedPose = 0;
    }

    async stopFaceLandmarker() {
        this.faceLandmarkerWorker.postMessage({
            action: 'clear_face_landmarker',
        });
        this.isRunningFaceLandmarker = false;
        this.isPrevFaceLandmarker = false;
        this.isRunWorkerFaceLandmarker = false;
        this.countDetectedFace = 0;
    }

    async stopObjectDetector() {
        if (this.canWorker) {
            this.objectDetectorWorker.postMessage({
                action: 'clear_object_detector',
            });
        } else {
            this.objectDetectorVideoCanvasCtx.clearRect(0, 0, this.video.width, this.video.height);
            if (GEHelper.isWebGL) {
                (this.objectDetectorCanvasOverlay as PIXI.Sprite).texture.update();
            }
        }
        this.isRunningObjectDetector = false;
        this.isPrevObjectDetector = false;
        this.countDetectedObject = 0;
    }

    async initPredictHandGesture() {
        const vision = await FilesetResolver.forVisionTasks(
            `${Entry.Utils.getEntryjsPath()}/extern/wasm`
        );
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
                // eslint-disable-next-line max-len
                modelAssetPath: `${Entry.Utils.getEntryjsPath()}/extern/model/gesture_recognizer.task`,
                delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
        });
    }

    async initPredictPoseLandmarker() {
        const vision = await FilesetResolver.forVisionTasks(
            `${Entry.Utils.getEntryjsPath()}/extern/wasm`
        );
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                // eslint-disable-next-line max-len
                modelAssetPath: `${Entry.Utils.getEntryjsPath()}/extern/model/pose_landmarker_lite.task`,
                delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 4,
        });
    }

    async initPredictObjectDetector() {
        const vision = await FilesetResolver.forVisionTasks(
            `${Entry.Utils.getEntryjsPath()}/extern/wasm`
        );
        this.objectDetector = await ObjectDetector.createFromOptions(vision, {
            baseOptions: {
                // eslint-disable-next-line max-len
                modelAssetPath: `${Entry.Utils.getEntryjsPath()}/extern/model/object_detector_lite.tflite`,
                delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            scoreThreshold: 0.5,
            maxResults: 8,
        });
    }

    contextFlip = (context, axis) => {
        if (this.flipState === 0) {
            context.scale(-1, 1);
            return {
                x: -axis.x * 640,
                y: axis.y * 360 - 20,
            };
        } else if (this.flipState === 1) {
            context.scale(1, 1);
            return {
                x: axis.x * 640,
                y: axis.y * 360 - 20,
            };
        } else if (this.flipState === 2) {
            context.scale(-1, -1);
            return {
                x: -axis.x * 640,
                y: -axis.y * 360 + 20,
            };
        } else if (this.flipState === 3) {
            context.scale(1, -1);
            return {
                x: axis.x * 640,
                y: -axis.y * 360 + 20,
            };
        }
    };

    async predictHandGesture() {
        try {
            let results;

            if (!this.gestureRecognizerVideoCanvasCtx || this.isRunningHandGesture === false) {
                return;
            }
            if (this.video.readyState < 2) {
                await this.sleep();
                this.predictHandGesture();
                return;
            }
            if (this.video.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.video.currentTime;
                const startTimeMs = Date.now();
                results = this.gestureRecognizer.recognizeForVideo(this.video, startTimeMs);
            } else {
                return;
            }
            this.gestureRecognizerVideoCanvasCtx.save();
            this.gestureRecognizerVideoCanvasCtx.clearRect(
                0,
                0,
                this.video.width,
                this.video.height
            );

            const { landmarks, handednesses } = results;
            this.prevGestureRecognizerResult = results;
            if (landmarks.length) {
                if (!this.isPrevHandDetected) {
                    this.isPrevHandDetected = true;
                    Entry.engine.fireEvent('when_hand_detection');
                }
                if (landmarks.length !== this.countDetectedHand) {
                    this.countDetectedHand = landmarks.length;
                }
                if (!this.isDrawDetectedHand) {
                    return;
                }

                landmarks.forEach((landmark, i) => {
                    let connectColor;
                    let landmarkColor;
                    const [handedness] = handednesses[i];
                    const mark12 = landmark[12];
                    const { x, y } = this.contextFlip(this.gestureRecognizerVideoCanvasCtx, mark12);
                    if (handedness.categoryName === 'Left') {
                        this.gestureRecognizerVideoCanvasCtx.fillStyle = '#FF0000';
                        this.gestureRecognizerVideoCanvasCtx.fillText(
                            `${i + 1}-${Lang.Blocks.right_hand}`,
                            x,
                            y
                        );
                        connectColor = '#FF0000';
                        landmarkColor = '#00FF00';
                    } else {
                        this.gestureRecognizerVideoCanvasCtx.fillStyle = '#00FF00';
                        this.gestureRecognizerVideoCanvasCtx.fillText(
                            `${i + 1}-${Lang.Blocks.left_hand}`,
                            x,
                            y
                        );
                        connectColor = '#00FF00';
                        landmarkColor = '#FF0000';
                    }
                    this.contextFlip(this.gestureRecognizerVideoCanvasCtx, mark12);
                    this.gestureRecognizerDrawingUtils.drawConnectors(
                        landmark,
                        GestureRecognizer.HAND_CONNECTIONS,
                        {
                            color: connectColor,
                            lineWidth: 4,
                        }
                    );
                    this.gestureRecognizerDrawingUtils.drawLandmarks(landmark, {
                        color: connectColor,
                        lineWidth: 4,
                        fillColor: landmarkColor,
                        radius: (e) => this.getYX(e.from!.z || 0),
                    });
                });
            } else {
                this.isPrevHandDetected = false;
                this.countDetectedHand = 0;
            }
        } finally {
            if (GEHelper.isWebGL) {
                (this.gestureRecognizerCanvasOverlay as PIXI.Sprite).texture.update();
            }
            this.gestureRecognizerVideoCanvasCtx.restore();
            if (this.isRunningHandGesture === true) {
                window.requestAnimationFrame(this.predictHandGesture.bind(this));
            }
        }
    }

    async predictPoseLandmarker() {
        try {
            let results;

            if (!this.poseLandmarkerVideoCanvasCtx || this.isRunningPoseLandmarker === false) {
                return;
            }
            if (this.video.readyState < 2) {
                await this.sleep();
                this.predictPoseLandmarker();
                return;
            }
            if (this.video.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.video.currentTime;
                const startTimeMs = performance.now();
                results = await this.poseLandmarker.detectForVideo(this.video, startTimeMs);
            } else {
                return;
            }
            this.poseLandmarkerVideoCanvasCtx.save();
            this.poseLandmarkerVideoCanvasCtx.clearRect(0, 0, this.video.width, this.video.height);

            const { landmarks } = results;
            this.prevPoseLandmarkerResult = results;
            if (landmarks.length) {
                if (!this.isPrevPoseLandmarker) {
                    this.isPrevPoseLandmarker = true;
                    Entry.engine.fireEvent('when_pose_landmarker');
                }
                if (landmarks.length !== this.countDetectedPose) {
                    this.countDetectedPose = landmarks.length;
                }
                if (!this.isDrawDetectedPoseLandmarker) {
                    return;
                }

                landmarks.forEach((landmark, i) => {
                    const mark7 = landmark[7];
                    this.poseLandmarkerVideoCanvasCtx.scale(-1, 1);
                    this.poseLandmarkerVideoCanvasCtx.fillStyle = '#FF0000';
                    this.poseLandmarkerVideoCanvasCtx.fillText(
                        `${i + 1}-${Lang.video_object_params.person}`,
                        -mark7.x * 640,
                        mark7.y * 360 - 20
                    );
                    this.poseLandmarkerVideoCanvasCtx.scale(-1, 1);
                    this.poseLandmarkerDrawingUtils.drawLandmarks(landmark, {
                        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
                    });
                    this.poseLandmarkerDrawingUtils.drawConnectors(
                        landmark,
                        PoseLandmarker.POSE_CONNECTIONS
                    );
                });
            } else {
                this.isPrevPoseLandmarker = false;
                this.countDetectedPose = 0;
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (GEHelper.isWebGL) {
                (this.poseLandmarkerCanvasOverlay as PIXI.Sprite).texture.update();
            }
            this.poseLandmarkerVideoCanvasCtx.restore();
            if (this.isRunningPoseLandmarker === true) {
                window.requestAnimationFrame(this.predictPoseLandmarker.bind(this));
            }
        }
    }

    async predictObjectDetector() {
        try {
            let results;

            if (!this.objectDetectorVideoCanvasCtx || this.isRunningObjectDetector === false) {
                return;
            }
            if (this.video.readyState < 2) {
                await this.sleep();
                this.predictObjectDetector();
                return;
            }
            if (this.video.currentTime !== this.lastVideoTime) {
                this.lastVideoTime = this.video.currentTime;
                const startTimeMs = performance.now();
                results = await this.objectDetector.detectForVideo(this.video, startTimeMs);
            } else {
                return;
            }
            this.objectDetectorVideoCanvasCtx.save();
            this.objectDetectorVideoCanvasCtx.clearRect(0, 0, this.video.width, this.video.height);

            const { detections } = results;
            this.prevObjectDetectorResult = results;
            if (detections.length) {
                if (!this.isPrevObjectDetector) {
                    this.isPrevObjectDetector = true;
                    Entry.engine.fireEvent('when_face_landmarker');
                }
                if (detections.length !== this.countDetectedObject) {
                    this.countDetectedObject = detections.length;
                }
                if (!this.isDrawDetectedObjectDetector) {
                    return;
                }
                detections.forEach((detect, i) => {
                    this.drawObjectDetections(detect, i);
                });
            } else {
                this.isPrevObjectDetector = false;
                this.countDetectedObject = 0;
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (GEHelper.isWebGL) {
                (this.objectDetectorCanvasOverlay as PIXI.Sprite).texture.update();
            }
            this.objectDetectorVideoCanvasCtx.restore();
            if (this.isRunningObjectDetector === true) {
                window.requestAnimationFrame(this.predictObjectDetector.bind(this));
            }
        }
    }

    objectContextFlip(context, axis) {
        if (this.flipState === 0) {
            context.scale(-1, 1);
            return {
                x: -axis.x - axis.offsetX,
                y: axis.y - axis.offsetY,
            };
        } else if (this.flipState === 1) {
            context.scale(1, 1);
            return {
                x: axis.x + 3,
                y: axis.y - axis.offsetY,
            };
        } else if (this.flipState === 2) {
            context.scale(-1, -1);
            return {
                x: -axis.x - axis.offsetX,
                y: -(axis.y - axis.offsetY - 6),
            };
        } else if (this.flipState === 3) {
            context.scale(1, -1);
            return {
                x: axis.x + 3,
                y: -(axis.y - axis.offsetY - 6),
            };
        }
    }

    drawObjectDetections(detect: Detection, i: number) {
        try {
            const { boundingBox, categories } = detect;
            const [category] = categories;
            const displayName = category.displayName || category.categoryName;
            const text = Lang.video_object_params[displayName] || displayName;

            const x = boundingBox.originX;
            const y = boundingBox.originY;
            const w = boundingBox.width;
            const h = boundingBox.height;
            const e = (this.VIDEO_WIDTH / 600) * 4;
            const measureText = this.objectDetectorVideoCanvasCtx.measureText(text);
            const l = measureText.width + 6;
            const measureSize =
                measureText.fontBoundingBoxAscent + measureText.fontBoundingBoxDescent + 2 * e;
            const m = x + w - l;
            this.objectDetectorVideoCanvasCtx.strokeStyle = colors[i];
            this.objectDetectorVideoCanvasCtx.beginPath();
            this.objectDetectorVideoCanvasCtx.moveTo(x, y);
            this.objectDetectorVideoCanvasCtx.lineTo(x + w, y);
            this.objectDetectorVideoCanvasCtx.lineTo(x + w, y + h);
            this.objectDetectorVideoCanvasCtx.lineTo(x, y + h);
            this.objectDetectorVideoCanvasCtx.lineTo(x, y);
            this.objectDetectorVideoCanvasCtx.stroke();
            this.objectDetectorVideoCanvasCtx.fillStyle = colors[i];
            this.objectDetectorVideoCanvasCtx.fillRect(m, y, l, measureSize);
            const { x: axisX, y: axisY } = this.objectContextFlip(
                this.objectDetectorVideoCanvasCtx,
                {
                    offsetX: l - 3,
                    offsetY: 3 * e,
                    x: m,
                    y: y + measureSize,
                }
            );
            this.objectDetectorVideoCanvasCtx.fillStyle = 'white';
            this.objectDetectorVideoCanvasCtx.fillText(text, axisX, axisY);
            this.objectContextFlip(this.objectDetectorVideoCanvasCtx, {
                offsetX: 0,
                offsetY: 0,
                x: 0,
                y: 0,
            });
        } catch (e) {
            console.error(e.stack);
        }
    }

    getFlipDirectionToSign() {
        if (this.flipState === 0) {
            return {
                x: 1,
                y: 1,
            };
        } else if (this.flipState === 1) {
            return {
                x: -1,
                y: 1,
            };
        } else if (this.flipState === 2) {
            return {
                x: 1,
                y: -1,
            };
        } else if (this.flipState === 3) {
            return {
                x: -1,
                y: -1,
            };
        }
    }

    getHandPointAxis(hand: number, handPoint: number) {
        if (!this.prevGestureRecognizerResult) {
            return;
        }
        const { landmarks } = this.prevGestureRecognizerResult;
        if (!landmarks.length) {
            return;
        }
        const landmark = landmarks[hand];
        const pointAxis = landmark[handPoint];
        const sign = this.getFlipDirectionToSign();
        return {
            x: (-pointAxis.x * this.STAGE_WIDTH + this.STAGE_WIDTH / 2) * sign.x,
            y: (-pointAxis.y * this.STAGE_HEIGHT + this.STAGE_HEIGHT / 2) * sign.y,
            z: pointAxis.z,
        };
    }

    getPosePointAxis(pose: number, posePoint: number) {
        if (!this.prevPoseLandmarkerResult) {
            return;
        }
        const { landmarks } = this.prevPoseLandmarkerResult;
        if (!landmarks.length) {
            return;
        }
        const landmark = landmarks[pose];
        const pointAxis = landmark[posePoint];
        const sign = this.getFlipDirectionToSign();
        return {
            x: (-pointAxis.x * this.STAGE_WIDTH + this.STAGE_WIDTH / 2) * sign.x,
            y: (-pointAxis.y * this.STAGE_HEIGHT + this.STAGE_HEIGHT / 2) * sign.y,
            z: pointAxis.z,
        };
    }

    getFacePointAxis(faceNum: number, facePoint: number) {
        if (!this.prevFaceLandmarkerResult) {
            return;
        }
        const { face = [] } = this.prevFaceLandmarkerResult;
        if (!face.length) {
            return;
        }
        const meshRaw = _get(face, `${faceNum}.meshRaw`);
        if (!meshRaw) {
            return;
        }
        const pointAxis = meshRaw[facePoint];
        const sign = this.getFlipDirectionToSign();
        return {
            x: (-pointAxis[0] * this.STAGE_WIDTH + this.STAGE_WIDTH / 2) * sign.x,
            y: (-pointAxis[1] * this.STAGE_HEIGHT + this.STAGE_HEIGHT / 2) * sign.y,
            z: pointAxis[2],
        };
    }

    getFaceGender(faceNum: number) {
        if (!this.prevFaceLandmarkerResult) {
            return;
        }
        const { face = [] } = this.prevFaceLandmarkerResult;
        if (!face.length) {
            return;
        }
        return _get(face, `${faceNum}.gender`);
    }

    getFaceAge(faceNum: number) {
        if (!this.prevFaceLandmarkerResult) {
            return;
        }
        const { face = [] } = this.prevFaceLandmarkerResult;
        if (!face.length) {
            return;
        }
        return Math.round(_get(face, `${faceNum}.age`, 0));
    }

    getFaceEmotion(faceNum: number) {
        if (!this.prevFaceLandmarkerResult) {
            return;
        }
        const { face = [] } = this.prevFaceLandmarkerResult;
        if (!face.length) {
            return;
        }
        return _get(face, `${faceNum}.emotion.0.emotion`);
    }

    getObjectPointAxis(face: number, facePoint: number) {
        if (!this.prevObjectDetectorResult) {
            return;
        }
        const { detections } = this.prevObjectDetectorResult;
        if (!detections.length) {
            return;
        }
        const detect = detections[face];
        return detect.boundingBox;
    }

    getHandedness(hand: number) {
        if (!this.prevGestureRecognizerResult) {
            return;
        }
        const { handednesses } = this.prevGestureRecognizerResult;
        if (!handednesses.length) {
            return;
        }
        return handednesses[hand][0];
    }

    getGesture(hand: number) {
        if (!this.prevGestureRecognizerResult) {
            return;
        }
        const { gestures } = this.prevGestureRecognizerResult;
        if (!gestures.length) {
            return;
        }
        return gestures[hand][0];
    }

    reset() {
        if (this.isInitGestureRecognition) {
            this.changeDrawDetectedHand(false);
            this.stopHandGestureRecognition();
            this.prevGestureRecognizerResult = undefined;
        }
        if (this.isInitPoseLandmarker) {
            this.changeDrawDetectedPoseLandmarker(false);
            this.stopPoseLandmarker();
            this.prevPoseLandmarkerResult = undefined;
        }
        if (this.isInitFaceLandmarker) {
            this.changeDrawDetectedFaceLandmarker(false);
            this.stopFaceLandmarker();
            this.prevFaceLandmarkerResult = undefined;
        }
        if (this.isInitObjectDetector) {
            this.changeDrawDetectedObjectDetector(false);
            this.stopObjectDetector();
            this.prevObjectDetectorResult = undefined;
        }
        GEHelper.setVideoAlpha(this.canvasVideo, 50);
        this.turnOffWebcam();
    }

    destroy() {
        this.isInitialized = false;
    }
}

export default singleInstance(MediaPipeUtils);
