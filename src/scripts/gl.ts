function loadShader(
    gl: WebGL2RenderingContext,
    type: GLenum,
    source: string,
): WebGLShader | null {
    const shader = gl.createShader(type);
    if (shader == null) {
        console.error("Failed to create shader " + shader);
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
            "An error occurred compiling the shaders: " +
                gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function initShaderProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
): WebGLProgram | null {
    const vertShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (vertShader == null || fragShader == null) return null;

    const program = gl.createProgram();
    if (program == null) {
        console.error("Failed to create shader program");
        return null;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(
            "Unable to initialize the shader program" +
                gl.getProgramInfoLog(program),
        );
        return null;
    }

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    return program;
}
