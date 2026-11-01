/** Low clouds occupy a finite 3D slab; upper ice clouds remain a separate thin layer. */
export const CLOUD_SHADER = `
  uniform sampler2D cloudNoise;
  uniform float lowCover, highCover, cloudDepth, flatness, marchSteps;
  uniform float raggedness, waves, opticalDepth;

  float noise3(vec3 p) {
    vec3 cell = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv = cell.xy + vec2(37.0, 239.0) * cell.z + f.xy;
    vec2 slices = texture2D(cloudNoise, (uv + 0.5) / 256.0).rg;
    return mix(slices.x, slices.y, f.z);
  }
  float cloudFbm(vec3 p) {
    return noise3(p) * 0.57 + noise3(p * 2.03 + 17.1) * 0.28
      + noise3(p * 4.11 + 31.7) * 0.15;
  }
  float layerDepth() {
    return mix(0.7, 3.8, cloudDepth);
  }
  float cloudBase() {
    return mix(3.0, 1.8, max(flatness, smoothstep(0.45, 1.0, cloudDepth)));
  }
  float localCloudBase(vec3 p) {
    vec2 drift = cloudOffset / 0.56;
    float relief = cloudFbm(vec3((p.xz + drift) * 0.26, 12.4)) - 0.5;
    float rolls = sin(dot(p.xz + drift, vec2(0.85, 0.22)));
    return cloudBase() + relief * mix(0.22, 0.65, flatness) + waves * rolls * 0.18;
  }
  vec2 cumulusShape(vec3 p, float h) {
    float cellularDeck = smoothstep(0.15, 0.4, flatness) * (1.0 - smoothstep(0.8, 0.99, flatness));
    float cellSize = mix(8.0, 5.3, cellularDeck);
    vec2 cell = floor(p.xz / cellSize);
    float shape = -1.0;
    float visibility = 0.0;
    // Each cluster has a coherent rounded body and rising lobes, rather than
    // unrelated noise slices. Nearby cells overlap without visible tile seams.
    for (int z = -1; z <= 1; z++) {
      for (int x = -1; x <= 1; x++) {
        vec2 id = cell + vec2(float(x), float(z));
        // Coverage activates different clusters instead of shrinking every cloud.
        float rank = hash(id + 7.3);
        float population = 1.0 - pow(1.0 - lowCover, 3.3);
        float presence = smoothstep(rank - 0.025, rank + 0.025, population);
        if (presence < 0.001) continue;
        float seed = hash(id + 99.1);
        vec2 centre = (id + 0.5) * cellSize
          + (vec2(hash(id + 13.1), hash(id + 41.7)) - 0.5) * cellSize * 0.75;
        vec2 q = p.xz - centre;
        float joining = smoothstep(0.4, 1.0, lowCover);
        float radius = cellSize * mix(0.3, 0.53, seed) * mix(1.15, 1.45, joining);
        if (dot(q, q) > radius * radius * 1.7) continue;
        float y = h / mix(0.72, 1.0, hash(id + 25.3));
        float stretch = mix(0.85, 1.25, hash(id + 65.1));
        float body = 1.0 - length(vec3(q.x / (radius * stretch), (y - 0.3) / 0.59, q.y / (radius * 0.85)));
        float lobeA = 1.0 - length(vec3((q.x + radius * 0.32) / (radius * 0.56),
          (y - 0.57) / 0.4, (q.y + radius * 0.12) / (radius * 0.62)));
        float lobeB = 1.0 - length(vec3((q.x - radius * 0.28) / (radius * 0.5),
          (y - 0.64) / 0.34, (q.y - radius * 0.14) / (radius * 0.54)));
        float candidate = max(body, max(lobeA, lobeB));
        if (candidate > shape) {
          shape = candidate;
          visibility = presence;
        }
      }
    }
    return vec2(shape, visibility);
  }
  float cloudDensity(vec3 p) {
    float h = (p.y - localCloudBase(p)) / layerDepth();
    if (h <= 0.0 || h >= 1.0) return 0.0;
    // A common condensation level keeps the bottom flatter than the lobed top.
    float heightMask = smoothstep(0.0, 0.09, h) * (1.0 - smoothstep(0.5, 1.0, h));
    vec3 q = p * vec3(0.56, 0.7, 0.56) + vec3(cloudOffset.x, 0.0, cloudOffset.y);
    float sheet = 0.0, puffs = 0.0;
    float joinedDeck = smoothstep(0.82, 1.0, lowCover);
    float cellularDeck = smoothstep(0.15, 0.4, flatness) * (1.0 - smoothstep(0.8, 0.99, flatness));
    if (flatness > 0.001 || joinedDeck > 0.001) {
      // A single horizontal footprint controls all heights of the same deck.
      // Independent noise slices would fill its gaps and exaggerate cloud cover.
      float field = cloudFbm(vec3(q.xz * mix(1.0, 2.1, cellularDeck), 9.3));
      field += waves * sin(dot(p.xz + cloudOffset / 0.56, vec2(0.85, 0.22))) * 0.06;
      float fraction = clamp(lowCover, 0.001, 0.999);
      float threshold = 0.5 - 0.045 * log(fraction / (1.0 - fraction));
      sheet = max(field - threshold - h * h * 0.2, 0.0) * 15.0;
      float fragments = smoothstep(threshold + 0.03, threshold + 0.16,
        cloudFbm(vec3(q.xz * 0.9, 39.2)) - cloudFbm(q * 3.5) * 0.08);
      sheet *= mix(1.0, fragments * 1.5, raggedness);
    }
    if (flatness < 0.999) {
      vec3 advected = p + vec3(cloudOffset.x, 0.0, cloudOffset.y) / 0.56;
      vec2 shape = cumulusShape(advected, h);
      float billows = (cloudFbm(q * 1.9) - 0.5) * 0.9
        + (cloudFbm(q * 7.5 + 19.0) - 0.5) * 0.28;
      puffs = smoothstep(-0.02, 0.08, shape.x + billows - 0.12) * 2.5 * shape.y;
      // Broken clusters coalesce into a deck near full cover while retaining crowns.
      puffs = mix(puffs, max(puffs, sheet), joinedDeck);
    }
    float density = mix(puffs, sheet, flatness);
    // Smaller shallow cells give stratocumulus rounded elements and blue gaps.
    // Adding an independent opaque sheet would fill those openings twice.
    density = mix(density, puffs, cellularDeck);
    return density * heightMask * smoothstep(0.0, 0.05, lowCover);
  }
  vec3 upperClouds(vec3 sky, vec3 dir, float twilight) {
    if (highCover < 0.005 || dir.y <= 0.0) return sky;
    vec2 p = dir.xz / max(dir.y, 0.08) * 1.4 + cloudOffset * 0.55;
    vec2 curl = vec2(cloudFbm(vec3(p * 0.35, 9.0)), cloudFbm(vec3(p * 0.35, 37.0)));
    vec2 warped = p + curl * 1.8;
    float bands = cloudFbm(vec3(warped * vec2(0.35, 1.8), 51.0));
    float fibres = cloudFbm(vec3(warped * vec2(0.6, 9.0), 72.0));
    float threshold = mix(0.73, 0.32, highCover);
    float veil = smoothstep(threshold, threshold + 0.2, bands)
      * smoothstep(0.28, 0.7, fibres) * highCover * 0.65 * smoothstep(0.0, 0.12, dir.y);
    // High ice clouds can still catch warm light while the lower deck has darkened.
    vec3 iceColor = cloudColor * 0.95 + sunColor * twilight * 0.14 * smoothstep(-0.08, -0.02, sunDirection.y);
    return mix(sky, iceColor, veil);
  }
  vec3 fractusClouds(vec3 sky, vec3 dir) {
    float distance = cloudBase() / max(dir.y, 0.02);
    vec2 p = dir.xz * distance * vec2(0.46, 0.62) + cloudOffset;
    float body = cloudFbm(vec3(p, 9.3));
    float erosion = cloudFbm(vec3(p * 3.4, 32.7));
    float fraction = clamp(lowCover, 0.001, 0.999);
    float threshold = 0.5 - 0.045 * log(fraction / (1.0 - fraction));
    float shreds = smoothstep(threshold - 0.025, threshold + 0.065, body - (erosion - 0.5) * 0.18);
    float opacity = shreds * 0.82 * exp(-distance * 0.018) * smoothstep(0.02, 0.13, dir.y);
    vec3 light = cloudColor * (0.65 + body * 0.25);
    return mix(sky, light, opacity);
  }
  vec3 lowerClouds(vec3 sky, vec3 dir) {
    if (lowCover < 0.005 || dir.y < 0.025) return sky;
    // Fractus is rendered as thin torn fragments, without extruding each shred
    // into an artificial vertical pillar or undersampling its tiny thickness.
    if (raggedness > 0.999) return fractusClouds(sky, dir);
    float entry = max(0.1, cloudBase() - 0.5) / dir.y;
    float exitPoint = min((cloudBase() + layerDepth() + 0.5) / dir.y, 70.0);
    if (entry >= exitPoint) return sky;
    float stepLength = (exitPoint - entry) / marchSteps;
    float jitter = 0.5 + (hash(gl_FragCoord.xy + 0.37) - 0.5) * 0.3;
    float transmittance = 1.0;
    vec3 scattered = vec3(0.0);
    vec3 lightDir = normalize(sunDirection + vec3(0.0, 0.08, 0.0));
    float forwardScatter = pow(max(dot(dir, lightDir), 0.0), 12.0);
    for (int i = 0; i < 40; i++) {
      if (float(i) >= marchSteps || transmittance < 0.015) break;
      vec3 p = dir * (entry + (float(i) + jitter) * stepLength);
      float density = cloudDensity(p);
      if (density > 0.005) {
        // Secondary samples towards the sun produce actual internal shadowing.
        float lightDepth = cloudDensity(p + lightDir * 0.65) * 0.8
          + cloudDensity(p + lightDir * 1.8) * 0.65;
        float sunlight = exp(-lightDepth * 1.1);
        float h = clamp((p.y - localCloudBase(p)) / layerDepth(), 0.0, 1.0);
        float deck = max(flatness, smoothstep(0.7, 1.0, lowCover));
        float column = cloudFbm(vec3(p.xz * 0.38 + cloudOffset * 0.7, 22.5));
        // Thick columns receive less diffuse light; this remains visible even
        // when the whole sky is covered and direct sunlight is extinguished.
        float ambient = mix(mix(0.68, 0.57, deck), 0.8, h) - (column - 0.5) * mix(0.08, 0.38, deck);
        vec3 lighting = cloudColor * (ambient + sunlight * 0.18) * (1.0 - storm * 0.45);
        lighting += sunColor * sunlight * forwardScatter * daylight * (1.0 - haze) * 0.035;
        float opacity = 1.0 - exp(-density * stepLength * 2.0 * opticalDepth);
        scattered += transmittance * opacity * lighting;
        transmittance *= 1.0 - opacity;
      }
    }
    vec3 result = sky * transmittance + scattered;
    // Atmospheric perspective softens the distant deck instead of a hard cutoff.
    float distanceFade = exp(-entry * 0.02) * smoothstep(0.025, 0.12, dir.y);
    return mix(sky, result, distanceFade);
  }
`;
