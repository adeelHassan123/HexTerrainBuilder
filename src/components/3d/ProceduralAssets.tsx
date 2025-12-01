import * as THREE from 'three';

/**
 * Procedural 3D asset generators for HexTerrainBuilder
 * These create simple but recognizable 3D shapes when model files are missing
 */

// Helper to create a tree with trunk and foliage
export function createTreeGeometry(type: string): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#4a2f1a' });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.4;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Foliage varies by tree type
    let foliageMaterial: THREE.MeshStandardMaterial;
    let foliageGeometry: THREE.BufferGeometry;

    switch (type) {
        case 'tree_pine':
            // Conical shape for pine
            foliageGeometry = new THREE.ConeGeometry(0.5, 1.0, 8);
            foliageMaterial = new THREE.MeshStandardMaterial({ color: '#1a5f1a' });
            break;
        case 'tree_dead':
            // Sparse, dark foliage
            foliageGeometry = new THREE.SphereGeometry(0.3, 6, 6);
            foliageMaterial = new THREE.MeshStandardMaterial({ color: '#3a3a2a' });
            break;
        case 'tree_palm':
            // Tall trunk, small top
            foliageGeometry = new THREE.ConeGeometry(0.4, 0.3, 6);
            foliageMaterial = new THREE.MeshStandardMaterial({ color: '#2d5f2d' });
            break;
        default:
            // Default round tree (oak, birch, maple, willow)
            foliageGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            foliageMaterial = new THREE.MeshStandardMaterial({ color: '#2d7a2d' });
    }

    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 1.1;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    tree.add(foliage);

    return tree;
}

// Helper to create rock formations
export function createRockGeometry(type: string): THREE.Group {
    const rock = new THREE.Group();

    let rockColor = '#808080';
    let rockGeometry: THREE.BufferGeometry;

    switch (type) {
        case 'rock_small':
            rockGeometry = new THREE.DodecahedronGeometry(0.3, 0);
            rockColor = '#9a9a9a';
            break;
        case 'rock_medium':
            rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
            rockColor = '#808080';
            break;
        case 'rock_large':
            rockGeometry = new THREE.DodecahedronGeometry(0.7, 0);
            rockColor = '#707070';
            break;
        case 'rock_cliff':
            // Tall vertical rock
            rockGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.6);
            rockColor = '#606060';
            break;
        case 'rock_mossy':
            rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
            rockColor = '#5a7a5a';
            break;
        default:
            rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
    }

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: rockColor,
        roughness: 0.9,
        metalness: 0.1
    });
    const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;

    // Slightly randomize rotation for natural look
    rockMesh.rotation.set(
        Math.random() * 0.3,
        Math.random() * Math.PI * 2,
        Math.random() * 0.3
    );

    rock.add(rockMesh);
    return rock;
}

// Helper to create buildings
export function createBuildingGeometry(type: string): THREE.Group {
    const building = new THREE.Group();

    switch (type) {
        case 'house_cottage': {
            // Base house
            const wallGeometry = new THREE.BoxGeometry(1.0, 0.8, 1.0);
            const wallMaterial = new THREE.MeshStandardMaterial({ color: '#8b7355' });
            const walls = new THREE.Mesh(wallGeometry, wallMaterial);
            walls.position.y = 0.4;
            walls.castShadow = true;
            walls.receiveShadow = true;
            building.add(walls);

            // Roof
            const roofGeometry = new THREE.ConeGeometry(0.7, 0.5, 4);
            const roofMaterial = new THREE.MeshStandardMaterial({ color: '#654321' });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 1.05;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            building.add(roof);
            break;
        }
        case 'tower_watch': {
            // Tall tower
            const towerGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
            const towerMaterial = new THREE.MeshStandardMaterial({ color: '#888888' });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.y = 0.75;
            tower.castShadow = true;
            tower.receiveShadow = true;
            building.add(tower);

            // Battlements
            const battlement = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.4, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: '#666666' })
            );
            battlement.position.y = 1.6;
            battlement.castShadow = true;
            building.add(battlement);
            break;
        }
        case 'ruin_stone': {
            // Broken walls
            const wall1 = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.2),
                new THREE.MeshStandardMaterial({ color: '#7a7a7a' })
            );
            wall1.position.set(0, 0.3, 0.3);
            wall1.castShadow = true;
            wall1.receiveShadow = true;
            building.add(wall1);

            const wall2 = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.5, 0.6),
                new THREE.MeshStandardMaterial({ color: '#757575' })
            );
            wall2.position.set(0.3, 0.25, 0);
            wall2.castShadow = true;
            wall2.receiveShadow = true;
            building.add(wall2);
            break;
        }
        case 'bridge_wood': {
            // Wooden planks
            const plankGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
            const plankMaterial = new THREE.MeshStandardMaterial({ color: '#6b4423' });
            const planks = new THREE.Mesh(plankGeometry, plankMaterial);
            planks.position.y = 0.05;
            planks.castShadow = true;
            planks.receiveShadow = true;
            building.add(planks);

            // Support posts
            const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
            const postMaterial = new THREE.MeshStandardMaterial({ color: '#4a2f1a' });
            [-0.4, 0, 0.4].forEach(x => {
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(x, -0.15, 0);
                post.castShadow = true;
                building.add(post);
            });
            break;
        }
    }

    return building;
}

// Helper to create scatter props
export function createScatterGeometry(type: string): THREE.Group {
    const scatter = new THREE.Group();

    switch (type) {
        case 'scatter_grass': {
            // Small grass blades
            const bladeGeometry = new THREE.ConeGeometry(0.05, 0.3, 4);
            const bladeMaterial = new THREE.MeshStandardMaterial({ color: '#3a7a3a' });
            for (let i = 0; i < 5; i++) {
                const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
                blade.position.set(
                    (Math.random() - 0.5) * 0.2,
                    0.15,
                    (Math.random() - 0.5) * 0.2
                );
                blade.castShadow = true;
                scatter.add(blade);
            }
            break;
        }
        case 'scatter_flowers': {
            // Small colorful spheres
            const stemGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 4);
            const stemMaterial = new THREE.MeshStandardMaterial({ color: '#2a5a2a' });
            const petalGeometry = new THREE.SphereGeometry(0.08, 6, 6);
            const colors = ['#ff69b4', '#ffff00', '#ff6347', '#9370db'];

            for (let i = 0; i < 4; i++) {
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.set(
                    (Math.random() - 0.5) * 0.3,
                    0.1,
                    (Math.random() - 0.5) * 0.3
                );
                scatter.add(stem);

                const petal = new THREE.Mesh(
                    petalGeometry,
                    new THREE.MeshStandardMaterial({ color: colors[i % colors.length] })
                );
                petal.position.set(stem.position.x, 0.22, stem.position.z);
                petal.castShadow = true;
                scatter.add(petal);
            }
            break;
        }
        case 'scatter_mushroom': {
            // Mushroom cap and stem
            const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6);
            const stemMaterial = new THREE.MeshStandardMaterial({ color: '#e8e8d8' });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.075;
            stem.castShadow = true;
            scatter.add(stem);

            const capGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const capMaterial = new THREE.MeshStandardMaterial({ color: '#c44538' });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.2;
            cap.scale.y = 0.6;
            cap.castShadow = true;
            scatter.add(cap);
            break;
        }
        case 'scatter_log': {
            // Fallen log
            const logGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
            const logMaterial = new THREE.MeshStandardMaterial({ color: '#5a4a3a' });
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.rotation.z = Math.PI / 2;
            log.position.y = 0.15;
            log.castShadow = true;
            log.receiveShadow = true;
            scatter.add(log);
            break;
        }
        case 'scatter_fern': {
            // Fern fronds
            const frondGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
            const frondMaterial = new THREE.MeshStandardMaterial({ color: '#2d5a2d' });
            for (let i = 0; i < 3; i++) {
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                frond.position.y = 0.2;
                frond.rotation.y = (i * Math.PI * 2) / 3;
                frond.rotation.x = 0.3;
                frond.castShadow = true;
                scatter.add(frond);
            }
            break;
        }
        case 'scatter_vine': {
            // Hanging vine
            const vineGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.6, 4);
            const vineMaterial = new THREE.MeshStandardMaterial({ color: '#3a5a3a' });
            const vine = new THREE.Mesh(vineGeometry, vineMaterial);
            vine.position.y = 0.3;
            vine.castShadow = true;
            scatter.add(vine);

            // Leaves along vine
            const leafGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            for (let i = 0; i < 3; i++) {
                const leaf = new THREE.Mesh(leafGeometry, vineMaterial);
                leaf.position.set(0.04, 0.1 + i * 0.15, 0);
                scatter.add(leaf);
            }
            break;
        }
    }

    return scatter;
}

// Main function to create any asset procedurally
export function createProceduralAsset(assetType: string): THREE.Group {
    // Determine category from asset type
    if (assetType.startsWith('tree_')) {
        return createTreeGeometry(assetType);
    } else if (assetType.startsWith('rock_')) {
        return createRockGeometry(assetType);
    } else if (assetType.includes('house_') || assetType.includes('tower_') || assetType.includes('ruin_') || assetType.includes('bridge_')) {
        return createBuildingGeometry(assetType);
    } else if (assetType.startsWith('scatter_')) {
        return createScatterGeometry(assetType);
    }

    // Fallback: simple box
    const fallback = new THREE.Group();
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: '#888888' })
    );
    box.castShadow = true;
    box.receiveShadow = true;
    fallback.add(box);
    return fallback;
}
