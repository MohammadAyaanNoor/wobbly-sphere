uniform float uTime;
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uTimeFrequency;
uniform float uWarpPositionFrequency;
uniform float uWarpStrength;
uniform float uWarpTimeFrequency;
attribute vec4 tangent;

varying float vWobble;

#include ../includes/simplexNoise4d.vert

float getWobble(vec3 position){
    vec3 warpedPosition = position;
    warpedPosition += simplexNoise4d(vec4(
        position * uWarpPositionFrequency,
        uTime * uWarpTimeFrequency
    )) * uWarpStrength;

    return  simplexNoise4d(vec4(
        warpedPosition * uPositionFrequency,
        uTime * uTimeFrequency
    )) * uStrength;
}
void main(){
    vec3 biTangent = cross(normal,tangent.xyz);
    //neighbours position
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;
    //wobble
    float wobble = getWobble(csm_Position);
    csm_Position += wobble * normal;
    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) * normal;
    //compute normals
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB- csm_Position);

    csm_Normal = cross(toA,toB);

    //varyings
    vWobble = wobble / uStrength;
   
}