import { useState, useEffect, useRef } from 'react';
import { Modal, Button, CloseButton, Nav, Tabs, Tab, TabContent, Form, InputGroup, FormControl } from 'react-bootstrap';
import CodeMirror from '@uiw/react-codemirror';
import { render } from "../webgpu/runner";
import { StreamLanguage } from '@codemirror/stream-parser';
import { javascript } from '@radu/legacy-modes/mode/javascript';
import { endpoint, userKey, admin, reason } from '../App';
import { useParams } from 'react-router';
import { v4 as uuid_v4 } from "uuid";
import Overlay from 'react-bootstrap/Overlay';
import './ShaderEditor.css';
import useTitle from '../utils/title';
import { Rating } from 'react-simple-star-rating' //for rating

const splitStyle = {
    marginBottom: "0em",
    marginLeft: "0em",
    marginTop: "0em",
    marginRight: "0em",
    height: "100vh",
    width: "50%",
    maxWidth: "50vw",
    display: "inline-table",
};

const defaultVertex: string = `
struct Output {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] vColor : vec4<f32>;
};

[[stage(vertex)]]
fn main([[builtin(vertex_index)]] VertexIndex: u32) -> Output {
    var pos : array<vec2<f32>, 6> = array<vec2<f32>, 6>(             
        vec2<f32>(-0.5,  -0.5),
        vec2<f32>(0.5,  0.5),
        vec2<f32>(0.5,  -0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5,  0.5),
        vec2<f32>(-0.5, 0.5)
    );

    var output: Output;
    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    output.vColor = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    return output;
}`;

const defaultFragment: string = `
[[stage(fragment)]]
fn main([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return vColor;
}`;

const defaultCompute: string = `
[[stage(compute), workgroup_size(1)]]
fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {

}
`;

const defaultVertexBuffer: string = "";

const defaultColourBuffer: string = "";

const defaultFilename: string = "";
const defaultTagsname: string = "";

const defaultIsVisible: boolean = true;

function convertBase64ToBlob(base64Image: string) {
    // Split into two parts
    const parts = base64Image.split(';base64,');
  
    // Hold the content type
    const imageType = parts[0].split(':')[1];
  
    // Decode Base64 string
    const decodedData = window.atob(parts[1]);
  
    //
    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);
  
    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
  
    // Return BLOB image after conversion
    return new Blob([uInt8Array], { type: imageType });
}

async function reportShader(
    ownerId: string,
    creationName: string,
    isSubmission: string,
    reportReason: string,
) {
    const codeData = new FormData();

    codeData.append("creatorId", ownerId);
    codeData.append("creationName", creationName);
    codeData.append("isSubmission", isSubmission);
    codeData.append("message", reportReason);

    await fetch(endpoint + 'filemanagement/report/', {
        method: 'POST',
        body: codeData
    })
        .then(data => data.json(), () => "");
}

// gives rating to database
async function updateRating(newRating: number, name: string) {
    let uid = localStorage.getItem(userKey);
    if (uid === null) {
        uid = "0";
        alert("You need to be logged in to rate")
        return null
    }

    const ratingData = new FormData();
    

    ratingData.append('creationName', name)
    ratingData.append('newRating', newRating.toString())
    ratingData.append('raterID', uid)

    return fetch(endpoint + 'filemanagement/updateRating/', {
        method: 'POST',
        body: ratingData,
      })
        .then(data => data.json(), () => "")
}

async function submitCode(name: string) {
    const creationData = new FormData();

    let uid = localStorage.getItem(userKey);
    if (uid === null) {
        uid = "0";
        alert("You need to be logged in to submit")
        return null
    }

    creationData.append("uid", uid);
    creationData.append("creationID", name);
    
    await fetch(endpoint + 'filemanagement/submitCreation/', {
        method: 'POST',
        body: creationData
    })
        .then(data => data.json(), () => "");

}

async function unReport(creationName: string, creatorId: string, isSubmission: boolean) {
    const creationData = new FormData();
    
    let adminUid = localStorage.getItem(userKey);
    if (adminUid === null) 
        adminUid = "0";

    creationData.append("uid", adminUid);
    creationData.append("creationName", creationName);
    creationData.append("creatorId", creatorId);
    creationData.append("isSubmission", isSubmission ? "true" : "false");
    
    await fetch(endpoint + 'filemanagement/unreport/', {
        method: 'POST',
        body: creationData
    })
}

async function deleteCreation (creatorUid: string, creationID: string, isSubmission: boolean){
    const creationData = new FormData();

    let adminUid = localStorage.getItem(userKey);
    if (adminUid === null) 
        adminUid = "0";

    creationData.append("admin", adminUid);
    creationData.append("uid", creatorUid);
    creationData.append("creationID", creationID);
    creationData.append("isSubmission", isSubmission ? "true" : "false");
    
    await fetch(endpoint + 'filemanagement/deleteCreation/', {
        method: 'POST',
        body: creationData
    })
}

// saves given code to database
async function saveCode(vertexShader: string, fragmentShader: string,
    computeShader: string, primitiveTopology: GPUPrimitiveTopology, vertexCount: number,
    vertexBuffer: string, colourBuffer: string, name: string, displayName: string, 
    tags: string,
     frame: HTMLImageElement) {
    const codeData = new FormData();

    codeData.append("vertex", vertexShader);
    codeData.append("fragment", fragmentShader);
    codeData.append("compute", computeShader);
    codeData.append("primitive", primitiveTopology);
    codeData.append("vertexCount", vertexCount.toString());
    codeData.append("vertexBuffer", vertexBuffer);
    codeData.append("colourBuffer", colourBuffer);

    if (displayName === null || displayName.length === 0) {
        // TODO: add error log
    } else {
        codeData.append("displayName", displayName);
    }

    let uid = localStorage.getItem(userKey);
    if (uid === null)
        uid = "0";

    codeData.append("uid", uid);
    codeData.append("name", name);
    codeData.append("updateFile", "True");
    codeData.append("tags", tags);
    codeData.append("image", convertBase64ToBlob(frame.src));
    await fetch(endpoint + 'filemanagement/saveFile/', {
        method: 'POST',
        body: codeData
    })
        .then(data => data.json(), () => "");
}

async function changeVisibility(visibility: boolean, name: string) {
    const codeData = new FormData();
    let uid = localStorage.getItem(userKey);

    if (uid === null)
        uid = "0";

    const upperCaseVisibility = (String(visibility))[0].toUpperCase() + (String(visibility)).substr(1).toLowerCase();
    
    codeData.append("uid", uid);
    
    codeData.append("creationName", name);
    codeData.append("public", upperCaseVisibility);

    return fetch(endpoint + 'filemanagement/updateVisibility/', {
        method: 'POST',
        body: codeData
      })
        .then(data => data.json(), () => "");
}

async function fetchCreation(uid: string | null, name: string) {
    if (uid === null)
        uid = "0";
    
    return fetch(endpoint + `filemanagement/getFile/?filePath=${uid}/${name}`, {
      method: 'Get',
    });
}

async function fetchSubmission( name: string) {
    
    return fetch(endpoint + `filemanagement/getSubmission/?creationID=${name}`, {
      method: 'Get',
    });
}

function parseFloat32Array(buffer: string): Float32Array {
    var newBuffer = buffer.replace(/\s*\(.*?\)\s*/g, "").replace(/\s/g, "").split(",").map(parseFloat);
    return new Float32Array(newBuffer);
}

interface IProps {
    shaderEditor: {
        isReported: boolean
    }
  }
  

export const ShaderEditor = ({ shaderEditor }: IProps) =>  {
    const uid = localStorage.getItem(userKey);
    const isAdmin = localStorage.getItem(admin) === 'true' || localStorage.getItem(admin) === 'True';
    const loggedIn = !(uid === null || uid === "0" || uid === "undefined");
    const display = loggedIn ? "show" : "none";

    type Creation = {
        isSubmission: string,
        ownerId: string,
        name: string,
    };
    
    const { isSubmission, ownerId, name } = useParams<Creation>();

    const isViewer: boolean = isSubmission === "true";

    const ownedByCurrent: boolean = uid !== null && uid !== "0" && uid !== "undefined" && uid === ownerId;

    const defaultPrimitiveTopology = "triangle-list";
    const defaultVertexCount: number = 6;

    const [pleaseLoginShow, setPleaseLoginShow] = useState(false);
    const [reportShow, setReportShow] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [otherReasonsVisibility, setOtherReasonsVisibility] = useState("none");
    // const [otherReasonsValue, setOtherReasonsValue] = useState("");
    const [update, setUpdate] = useState(false);
    const vertexShader = useRef(defaultVertex);
    const fragmentShader = useRef(defaultFragment);
    const computeShader = useRef(defaultCompute);
    const vertexBuffer = useRef(defaultVertexBuffer);
    const colourBuffer = useRef(defaultColourBuffer);
    const vertexCount = useRef(defaultVertexCount);
    const [vertexCount1, setVertexCount1] = useState(defaultVertexCount);
    const [isVisible, setIsVisible] = useState(defaultIsVisible);
    const [displayName, setDisplayName] = useState(defaultFilename);
    const [displayTagsName, setDisplayTagsName] = useState(defaultTagsname);
    const primitiveTopology = useRef<GPUPrimitiveTopology>(defaultPrimitiveTopology);
    const webGPUAdapter = useRef<GPUAdapter>()
    const webGPUDevice = useRef<GPUDevice>();
    const mouseX = useRef(0.0);
    const mouseY = useRef(0.0);
    const changedCode = useRef(true);
    const frame = useRef<HTMLImageElement>();
    const averageRating = useRef(0.0);
    const userRating = useRef(0.0)

    var t = 0;
    useTitle(displayName === '' ? 'Untitled' : displayName)

    const reportHandleClose = () => setReportShow(false);
    const reportHandleShow = () => {
        if (loggedIn) {
            setReportShow(true);
        } else {
            pleaseLoginHandleShow()
        }
    }

    const pleaseLoginHandleClose = () => setPleaseLoginShow(false);
    const pleaseLoginHandleShow = () => setPleaseLoginShow(true);

    const renderFrame = () => {
        render(
            vertexShader.current, fragmentShader.current, computeShader.current, primitiveTopology.current, vertexCount.current,
            webGPUDevice.current!, webGPUAdapter.current!, mouseY.current, mouseX.current,
            parseFloat32Array(vertexBuffer.current), parseFloat32Array(colourBuffer.current),
            changedCode.current, frame, t
        );
        t++;
        changedCode.current = false;
    };
  
    const tick = () => {
      if (webGPUAdapter.current !== undefined && webGPUDevice.current !== undefined)
            renderFrame();
      requestAnimationFrame(tick);
    };

    useEffect(() => {
        window.addEventListener("mousemove", (e) => { mouseX.current = e.clientX; mouseY.current = e.clientY});
        initWebGPU().then();

        if (!isViewer) {

            fetchCreation(ownerId, name)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        vertexShader.current = data.vertex;
                        fragmentShader.current = data.fragment;
                        primitiveTopology.current = data.primitive;
                        vertexCount.current = data.vertexCount;
                        setIsVisible(data.visibility);
                        setDisplayName(data.displayName);
                        vertexBuffer.current = data.vertex_buffer;
                        colourBuffer.current = data.colour_buffer;
                        computeShader.current = data.compute;
                        setDisplayTagsName(data.tags);
                        // TODO: remove this code and make the switch have the right value from the beginning, without using the following 4 3ines
                        // sorry, I was tired
                        const input = (document.getElementById('visibility-switch') as HTMLInputElement);
                        if (input != null && input.labels != null)
                            input.checked = isVisible;

                        setUpdate(!update);
                    })
                }
            });
        } else {
            fetchSubmission(name)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        vertexShader.current = data.vertex;
                        fragmentShader.current = data.fragment;
                        primitiveTopology.current = data.primitive;
                        vertexCount.current = data.vertexCount;
                        setIsVisible(data.visibility);
                        setDisplayName(data.displayName);
                        setDisplayTagsName(data.tags);
                        vertexBuffer.current = data.vertex_buffer;
                        colourBuffer.current = data.colour_buffer;
                        computeShader.current = data.compute;
                        averageRating.current = data.averageRating;

                        var raters = data.raters;

                        let adjustedUid = "0";
                        if (uid !== null)
                            adjustedUid = uid;

                        if (raters[adjustedUid.toString()] !== undefined) {
                            let tempUserRating = raters[adjustedUid];
                            if (tempUserRating !== undefined) {
                                userRating.current = tempUserRating
                            }
                        } else {
                            userRating.current = averageRating.current;
                        }
                        
                        // TODO: remove this code and make the switch have the right value from the beginning, without using the following 4 3ines
                        // sorry, I was tired
                        const input = (document.getElementById('visibility-switch') as HTMLInputElement);
                        if (input != null && input.labels != null)
                            input.checked = isVisible;

                        setUpdate(!update);
                    })
                }
            });
        }
            
        requestAnimationFrame(tick);
    }, // eslint-disable-next-line
        [])

    async function initWebGPU() {
        if (navigator.gpu === undefined) {
            alert("WebGPU is not supported/enabled in your browser")
            return false;
        }

        // Get a GPU device to render with
        var adapter = await navigator.gpu.requestAdapter();

        if (adapter == null) {
            alert("Adapter is null :(");
            return false;
        }
        webGPUAdapter.current = adapter;

        var device = await adapter.requestDevice();
        webGPUDevice.current = device;
        return true
    }

    const saveName = ownedByCurrent ? name : uuid_v4();

    const save = () => saveCode(
        vertexShader.current,
        fragmentShader.current,
        computeShader.current,
        primitiveTopology.current,
        vertexCount.current,
        vertexBuffer.current,
        colourBuffer.current,
        saveName,
        displayName,
        displayTagsName,
        frame.current!
    );

    const report = () => reportShader(
        ownerId,
        name,
        isSubmission,
        reportReason,
    );

    const submit = () => submitCode(
        saveName
    )
    const [show, setShow] = useState(false);
    const [closedPopup, setClosedPopup] = useState(false);
    const target = useRef(null);

    const [rating, setRating] = useState(userRating.current) // initial rating value

    // Catch Rating value
    const handleRating = (rate: number) => {
        setRating(rate)
        updateRating(rate/20, name)
    }

    if (isViewer) {
        return (
            <div style={{ display: "flex", height: "90vh", maxWidth: "100%", width: "100vw" }}>
                <Modal.Dialog size="xl" style={splitStyle}>
                    <Modal.Header style={{ height: "10vh"}} className="render-header">
                        <Modal.Title>Submission: {displayName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ height: "80vh" }} className="render-body">
                        <canvas id="webgpu-canvas" style={{ width: "100vw", height: "100%" }} />
                    </Modal.Body>
                    <Modal.Footer style={{ height: "10vh" }}>
                    </Modal.Footer>
                </Modal.Dialog>
                <Modal.Dialog size="xl" style={splitStyle}>
                    <Modal.Header style={{ height: "10vh" }} className="render-header">
                        <div className="navbar-brand" style={{fontSize: "24px"}}>
                            Rate:
                        </div>
                        <div className='rating' style={{height: "0vw"}}>
                            <Rating
                                onClick={handleRating}
                                showTooltip={false}
                                rtl={false}
                                transition={true}
                                tooltipDefaultText={'!Rate this submission'}
                                ratingValue={rating} /* Available Props */
                            />
                        </div>
                    </Modal.Header>
                </Modal.Dialog>
            </div>
        )
    } else {
        return (
            <div style={{ display: "flex", height: "90vh", maxWidth: "100%", width: "100vw" }}>
                <Modal.Dialog size="xl" style={splitStyle}>
                    <Modal.Header style={{ height: "10vh" }}>
                        <Modal.Title> Coding window </Modal.Title>
                        <form className="d-flex">
                            <input
                                style={{display: ownedByCurrent ? "show" : "none", width: "20vw"}}                    
                                className="form-control me-2" id="filename-input" type="search" placeholder="File name" aria-label="File name"
                                value={displayName}
                                onChange={(e) => { setDisplayName(e.target.value); }}
                            />
                            <input
                                readOnly
                                style={{display: !ownedByCurrent ? "show" : "none", width: "20vw"}}                    
                                className="form-control me-2" id="filename-input" type="search" placeholder="File name" aria-label="File name"
                                value={displayName}
                                onChange={(e) => { setDisplayName(e.target.value); }}
                            />
                        </form>
                        <form className="d-flex">
                            <input
                                style={{display: ownedByCurrent ? "show" : "none", width: "10vw"}}                    
                                className="form-control me-2" id="filename-input" type="search" placeholder="Add a tag" aria-label="Add a tag"
                                value={displayTagsName}
                                ref={target}
                                onChange={(e) => { setDisplayTagsName(e.target.value); setShow(!closedPopup) }}
                            />
                            <Overlay target={target.current} show={show} placement="right">
                            {({ placement, arrowProps, show: _show, popper, ...props }) => (
                                <div {...props} style={{ backgroundColor: 'rgba(220, 220, 220, 0.85)',
                                                        padding: '2px 10px',
                                                        color: 'black',
                                                        borderRadius: 3,
                                                        ...props.style, }}>
                                    Please separate the tags by space
                                    <CloseButton onClick={() => {setShow(!show); setClosedPopup(true)}}/>
                                </div> )}
                            </Overlay>
                        </form>
                        <Form style={{display: ownedByCurrent ? display : "none"}}>
                            <Form.Check 
                                type="switch"
                                id="visibility-switch"
                                checked={isVisible}
                                label="public"
                                onChange={() => { 
                                    changeVisibility(!isVisible, name); setIsVisible(!isVisible);
                                }}
                            />
                        </Form>
                    </Modal.Header>
                    <Modal.Body style={{ height: "70vh", padding: "0", color: "black" }}>
                        <Tabs defaultActiveKey="vertex" id="uncontrolled-tab-example" className="mb-3">
                            <Tab eventKey="vertex" title="Vertex">
                                <CodeMirror
                                    id="code_mirror_editor_vertex"
                                    className="code-window"
                                    theme="dark"
                                    value={vertexShader.current}
                                    extensions={[StreamLanguage.define(javascript)]}
                                    onChange={(value, viewUpdate) => { vertexShader.current = value; changedCode.current = true; }}
                                />
                            </Tab>
                            <Tab eventKey="fragment" title="Fragment">
                                <CodeMirror
                                    id="code_mirror_editor_fragment"
                                    className="code-window"
                                    theme="dark"
                                    value={fragmentShader.current}
                                    extensions={[StreamLanguage.define(javascript)]}
                                    onChange={(value, viewUpdate) => { fragmentShader.current = value; changedCode.current = true;}}
                                />
                            </Tab>
                            <Tab eventKey="compute" title="Compute">
                                <CodeMirror
                                    id="code_mirror_editor_compute"
                                    className="code-window"
                                    theme="dark"
                                    value={computeShader.current}
                                    extensions={[StreamLanguage.define(javascript)]}
                                    onChange={(value, viewUpdate) => { computeShader.current = value; changedCode.current = true;}}
                                />
                            </Tab>
                            <Tab eventKey="buffers" title="Buffers">
                                <table style={{ width: "50vw", textAlign: "center"}}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Modal.Title style={{fontSize: "1em", color: "white"}}> Vertex buffer </Modal.Title>
                                            </td>
                                            <td>
                                                <Modal.Title style={{fontSize: "1em", color: "white"}}> Colour buffer </Modal.Title>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <CodeMirror
                                    style={{paddingRight: "1px"}}
                                    id="code_mirror_editor_vertex_buffer"
                                    className="small-code-window"
                                    theme="dark"
                                    value={vertexBuffer.current}
                                    onChange={(value, viewUpdate) => {vertexBuffer.current = value; changedCode.current = true;}}
                                />
                                <CodeMirror
                                    style={{paddingLeft: "1px"}}
                                    id="code_mirror_editor_colour_buffer"
                                    className="small-code-window"
                                    theme="dark"
                                    value={colourBuffer.current}
                                    onChange={(value, viewUpdate) => {colourBuffer.current = value; changedCode.current = true;}}
                                />
                                </Tab>
                                <Tab eventKey="primitive" title="Primitive">
                                    <Nav variant="pills"
                                        className="flex-column"
                                        id="primitive_topology_list"
                                        onSelect={(k) => {
                                            if (k != null) primitiveTopology.current = k as GPUPrimitiveTopology;
                                        }}
                                        defaultActiveKey={defaultPrimitiveTopology}
                                    >
                                        <Nav.Item>
                                            <Nav.Link eventKey="point-list"> point-list </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="line-list"> line-list </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="line-strip"> line-strip </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="triangle-list"> triangle-list </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="triangle-strip"> triangle-strip </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Tab>
                                <Tab eventKey='vertex_count' title='Vertex count'>
                                    <input
                                        type="number"
                                        id="vertex_count"
                                        name="vertex_count"
                                        min="0"
                                        value={vertexCount1}
                                        onChange={e => {setVertexCount1(e.target.valueAsNumber); vertexCount.current = e.target.valueAsNumber; changedCode.current = true;}}
                                    />
        
                            </Tab>
                        </Tabs>
                        <TabContent>
                        </TabContent>
                    </Modal.Body>
                    <Modal.Footer style={{height: "10vh"}}>
                    {ownedByCurrent
                        ? <div>
                            <Button style={{ display: display }} onClick={() => save()}>
                                Save
                            </Button>
                            <div style={{ paddingLeft: "0.5vh", display: 'inline-block'}} >
                            <Button style={{ display: display }} onClick={() => submit()}>
                                Submit
                            </Button>
                            </div>
                        </div>
                        : <Button style={{ display: display }} onClick={() => save().then(_ => window.location.replace(`/editshader/${uid}/${saveName}`))}>
                            Fork
                            </Button>
                    }
                        
                    </Modal.Footer>
                </Modal.Dialog>
                <Modal.Dialog size="xl" style={splitStyle}>
                    <Modal.Header style={{ height: "10vh" }}>
                        <Modal.Title>Creation</Modal.Title>
                        <div>
                        {shaderEditor.isReported &&
                                <Button className="btn btn-info" onClick={() => {
                                    if (localStorage.getItem(reason) !== null)
                                        alert("report reasons: " + JSON.parse(localStorage.getItem(reason)!))
                            }}>Reason</Button>   
                        }
                            
                        {shaderEditor.isReported &&
                                <Button className="btn btn-success" onClick={() => unReport(name, ownerId, isViewer)
                                    .then(_ => {
                                        shaderEditor.isReported = false
                                        localStorage.removeItem(reason)
                                        window.location.reload()
                            })}>Allow</Button>
                        }
                            
                        {(shaderEditor.isReported || isAdmin) &&
                            <Button className="btn btn-danger" onClick={() => deleteCreation(ownerId, name, isViewer)
                                .then(_ => {
                                    shaderEditor.isReported = false
                                    localStorage.removeItem(reason)
                                    window.location.reload()
                            })}>Delete</Button>
                        }
                        </div>
                        <Button style={{display: ownedByCurrent ? "none" : "show"}} variant="outline-light" onClick={reportHandleShow}>
                            Report
                        </Button>

                        <Modal show={reportShow} onHide={reportHandleClose} centered size="lg">
                            <Modal.Header closeButton>
                            <Modal.Title> Why do you want to report this shader? </Modal.Title>

                            </Modal.Header>
                            
                            <Modal.Body>
                                <Form.Group id="reportForm" style={{paddingLeft: "2%"}} className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        label="Hate speech"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios1"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("Hate speech")
                                            setOtherReasonsVisibility("none")
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Explicit content"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios3"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("Explicit content")
                                            setOtherReasonsVisibility("none")
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Promotes violance"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios3"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("Promotes violance")
                                            setOtherReasonsVisibility("none")
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Spam"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios3"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("Spam")
                                            setOtherReasonsVisibility("none")
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="It is stolen content"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios3"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("It is stolen content")
                                            setOtherReasonsVisibility("none")
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Other reason"
                                        name="formHorizontalRadios"
                                        id="formHorizontalRadios3"
                                        style={{paddingTop: "1%"}}
                                        onChange={() => { 
                                            setReportReason("Other reason");
                                            setOtherReasonsVisibility("show")
                                        }}
                                    />
                                    <InputGroup
                                        className="mb-3"
                                    >
                                        <FormControl
                                            id="otherReasonsFormControl"
                                            // style={{display: otherReasonsVisibility}}
                                            placeholder="Please specify other reason"
                                            aria-label="Please specify other reason"
                                            aria-describedby="basic-addon2"
                                            disabled={otherReasonsVisibility === 'none'}
                                            onChange={(e) => { setReportReason(e.target.value); }}

                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={reportHandleClose}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={() => {report(); reportHandleClose()}}>
                                    Report
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <Modal show={pleaseLoginShow} onHide={pleaseLoginHandleClose} centered>
                            <Modal.Header closeButton>
                                <Modal.Title> Please login first </Modal.Title>
                            </Modal.Header>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={pleaseLoginHandleClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Modal.Header>
                    <Modal.Body style={{ height: "80vh" }} className="render-body">
                        <canvas id="webgpu-canvas" style={{ width: "50vw", height: "100%" }} />
                    </Modal.Body>
                    <Modal.Footer style={{ height: "10vh" }}>
                    </Modal.Footer>
                </Modal.Dialog>
            </div>
        );
    }
}

export default ShaderEditor;
