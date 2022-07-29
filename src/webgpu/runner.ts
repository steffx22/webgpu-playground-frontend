import { CreateGPUBuffer } from "./helper";

var loadedBuffers = false;

var vertexBuffer: GPUBuffer;
var colorBuffer: GPUBuffer;
var copyVertexBuffer: GPUBuffer;

var bindGroup: GPUBindGroup;
var bindGroupsVertexAndColour: GPUBindGroup[];
var bindGroupsComputeVertexAndColour: GPUBindGroup[];

export async function render(vertexShader: string, fragmentShader: string, computeShader: string, primitiveTopology: GPUPrimitiveTopology, vertexCount: number,
    device: GPUDevice, adapter: GPUAdapter, mouseY: number, mouseX: number, vertexBuffer: Float32Array, colourBuffer: Float32Array, buffersChanged: boolean, frame: React.MutableRefObject<HTMLImageElement | undefined>, t: number) {
    render_id(vertexShader, fragmentShader, computeShader, primitiveTopology, vertexCount, "webgpu-canvas", device, adapter, mouseY, mouseX,vertexBuffer, colourBuffer, buffersChanged, frame, t);
};

export async function render_id(vertexShader: string, fragmentShader: string, computeShader: string, primitiveTopology: GPUPrimitiveTopology,
    vertexCount: number, id: string, device: GPUDevice, adapter: GPUAdapter, mouseY: number, mouseX: number,
    vertexArray: Float32Array, colourArray: Float32Array, buffersChanged: boolean,
    frame: React.MutableRefObject<HTMLImageElement | undefined> | null, t: number) {

    // Get a context to display our rendered image on the canvas

    var canvas = document.getElementById(id) as HTMLCanvasElement;

    if (canvas == null) {
        alert("Canvas is null");
        return;
    }

    var context = canvas.getContext("webgpu");

    if (context == null) {
        alert("Context is nulll");
        return;
    }

    const presentationFormat = context.getPreferredFormat(adapter);
    context.configure({
        device,
        format: presentationFormat
    });

    const layout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
        ]
    });

    const layout2 = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
            {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
            {
                binding: 2,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
        ]
    });

    const layoutCompute = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                } as GPUBufferBindingLayout,
                sampler: undefined,
                texture: undefined,
                storageTexture: undefined,
                externalTexture: undefined,
            },
        ]
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [layout, layout2]
    });
    const pipelineComputeLayout = device.createPipelineLayout({
        bindGroupLayouts: [layout, layoutCompute]
    });

    let pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {
            module: device.createShaderModule({
                code: vertexShader
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: fragmentShader
            }),
            entryPoint: 'main',
            targets: [{
                format: presentationFormat,
            }]
        },
        primitive: {
            topology: primitiveTopology,
            stripIndexFormat: primitiveTopology.endsWith('list') ? undefined : 'uint32' as GPUIndexFormat
        }
    });

    let computePipeline = device.createComputePipeline({
        layout: pipelineComputeLayout,
        compute: {
            module: device.createShaderModule({
                code: computeShader
            }),
            entryPoint: 'main',
        }
    });

    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
        colorAttachments: [
            {
                view: textureView,
                loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                storeOp: 'store',
            } as GPURenderPassColorAttachment
        ],
    }

    let uniformsArray = new Float32Array([
        performance.now(), // time
        mouseX, // mouse x Axis
        mouseY, // mouse y Axis
    ]);

    let uniformsBuffer = createBuffer();

    bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformsBuffer
                },
            },
        ],
    });
    
    if (!loadedBuffers || buffersChanged) {
        loadedBuffers = true;

        vertexBuffer = CreateGPUBuffer(device, vertexArray, GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM);
        colorBuffer = CreateGPUBuffer(device, colourArray, GPUBufferUsage.VERTEX | GPUBufferUsage.UNIFORM);
        copyVertexBuffer = CreateGPUBuffer(device, vertexArray, GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM);

        bindGroupsVertexAndColour = new Array(2);
        for (let i = 0; i < 2; ++i) {
            bindGroupsVertexAndColour[i] = device.createBindGroup({
                layout: pipeline.getBindGroupLayout(1),
                entries: [
                    {
                        binding: (i === 0) ? 0 : 2,
                        resource: {
                            buffer: vertexBuffer,
                            offset: 0,
                            size: vertexArray.byteLength,
                        }
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: colorBuffer
                        }
                    },
                    {
                        binding: (i === 0) ? 2 : 0,
                        resource: {
                            buffer: copyVertexBuffer,
                            offset: 0,
                            size: vertexArray.byteLength,
                        }
                    }
                ],
            });
        }

        bindGroupsComputeVertexAndColour = new Array(2);
        for (let i = 0; i < 2; ++i) {
            bindGroupsComputeVertexAndColour[i] = device.createBindGroup({
                layout: computePipeline.getBindGroupLayout(1),
                entries: [
                    {
                        binding: (i === 0) ? 0 : 2,
                        resource: {
                            buffer: vertexBuffer,
                            offset: 0,
                            size: vertexArray.byteLength,
                        }
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: colorBuffer
                        }
                    },
                    {
                        binding: (i === 0) ? 2 : 0,
                        resource: {
                            buffer: copyVertexBuffer,
                            offset: 0,
                            size: vertexArray.byteLength,
                        }
                    }
                ],
            });
        }
    }
    
    async function rend() {

        const commandEncoder = device.createCommandEncoder();
        const textureView = context!.getCurrentTexture().createView();
        renderPassDescriptor.colorAttachments[0].view = textureView;

        {
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(computePipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.setBindGroup(1, bindGroupsComputeVertexAndColour[t % 2]);
            passEncoder.dispatch(10);
            passEncoder.endPass();
        }
        {
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.setBindGroup(1, bindGroupsVertexAndColour[(t + 1) % 2]);
            passEncoder.draw(vertexCount, 2, 0, 0);
            passEncoder.endPass();
        }

        device.queue.submit([commandEncoder.finish()]);
    }

    rend();

    function createBuffer() {
        let buffer = device.createBuffer({
            size: uniformsArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });
    
        const writeArray = new Float32Array(buffer.getMappedRange());
        writeArray.set(uniformsArray);
        buffer.unmap();

        return buffer;
    }

    if (frame !== null) {
        frame.current = (function convertCanvasToImage(canvas) {
            var image = new Image();
            image.src = canvas.toDataURL('image/png');
            return image;
        })(document.querySelectorAll('canvas')[0]);
    }
}

export { }
