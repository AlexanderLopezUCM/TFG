import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Alert, message } from "antd";

interface ModelProps {
	model: string;
	onError?: (message: string) => void;
}
interface ModelRendererProps {
	model?: string;
	height?: number;
}

const Model: React.FC<ModelProps> = ({ model, onError }) => {
	const modelRef = useRef<THREE.Group | null>(null);

	useEffect(() => {
		//	Assume there is always only at most 1 model
		if (modelRef.current && modelRef.current?.children.length > 0) modelRef.current?.remove(modelRef.current.children[0]);

		if (!model) return;

		const loader = new OBJLoader();

		try {
			const obj = loader.parse(model);

			if (modelRef.current) modelRef.current.add(obj);
		} catch (error) {
			console.error(error);
			onError?.("An error ocurred while loading the model");
		}
	}, [model, onError]);

	return <group ref={modelRef} />;
};

const ModelRenderer: React.FC<ModelRendererProps> = ({ model, height }) => {
	if (!model) return <Alert message="Could not load model" type="error" />;

	const [messageAPI, contextHolder] = message.useMessage();

	const showError = (content: string) => {
		messageAPI.open({
			type: "error",
			content: content,
		});
	};

	height ??= 700;

	return (
		<div style={{ height }}>
			{contextHolder}
			<Canvas camera={{ position: [0, 0, -3], fov: 50 }} style={{ background: "rgb(240, 240, 240)" }}>
				<ambientLight intensity={1} />

				<pointLight position={[-2, -2, -2]} intensity={10} />
				<pointLight position={[2, -2, -2]} intensity={10} />
				<pointLight position={[-2, -2, 2]} intensity={10} />
				<pointLight position={[2, -2, 2]} intensity={10} />

				<pointLight position={[-2, 2, -2]} intensity={10} />
				<pointLight position={[2, 2, -2]} intensity={10} />
				<pointLight position={[-2, 2, 2]} intensity={10} />
				<pointLight position={[2, 2, 2]} intensity={10} />

				<Model model={model} onError={showError} />

				<OrbitControls />
			</Canvas>
		</div>
	);
};

export default ModelRenderer;

// import React, { useRef, useEffect } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { message } from "antd";

// //	Type declaration
// interface ModelProps {
// 	modelName?: string;
// }

// //	Component declaration
// const ModelRenderer: React.FC<ModelProps> = ({ modelName }) => {
// 	const modelRef = useRef<THREE.Group | null>(null);
// 	const [messageAPI, contextHolder] = message.useMessage();

// 	const showError = (content: string) => {
// 		messageAPI.open({
// 			type: "error",
// 			content: content,
// 		});
// 	};

// 	useEffect(() => {
// 		console.log('Ref: %s', modelRef.current);
// 		console.log(`Model: ${modelName}`);

// 		if (!modelName) return;

// 		const loadNewModel = () => {
// 			//	Remove all objects from scene
// 			if (modelRef.current) while (modelRef.current.children.length > 0) modelRef.current.remove(modelRef.current.children[0]);

// 			//	Load new model
// 			const loader = new GLTFLoader();

// 			loader.load(
// 				`\\models\\${modelName}`,
// 				(gltf) => {
// 					if (modelRef.current) modelRef.current.add(gltf.scene);
// 				},
// 				undefined,
// 				() => {
// 					showError("Failed to load the provided model. Check for spelling.");
// 				}
// 			);
// 		};

// 		loadNewModel();
// 		console.log('Ref: %s', modelRef.current);
// 	}, [modelName]);

// 	return (
// 		<>
// 			{contextHolder}
// 			<Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "rgb(220, 220, 220)" }}>
// 				<ambientLight intensity={1} />

// 				<pointLight position={[-2, -2, -2]} intensity={10} />
// 				<pointLight position={[2, -2, -2]} intensity={10} />
// 				<pointLight position={[-2, -2, 2]} intensity={10} />
// 				<pointLight position={[2, -2, 2]} intensity={10} />

// 				<pointLight position={[-2, 2, -2]} intensity={10} />
// 				<pointLight position={[2, 2, -2]} intensity={10} />
// 				<pointLight position={[-2, 2, 2]} intensity={10} />
// 				<pointLight position={[2, 2, 2]} intensity={10} />

// 				<group ref={modelRef} />

// 				<OrbitControls />
// 			</Canvas>
// 		</>
// 	);
// };

// export default ModelRenderer;
