class MaterialMenu {
    constructor(controlPanel) {
        this.controlPanel = controlPanel;
        this.menu = document.getElementById('materialMenu');
        this.addMaterialMenu = document.getElementById('addMaterialMenu');

        // Создание кнопок с обработчиками событий
        this.chooseMaterialButton = new Button('material', () => this.showMaterialMenu());
        this.backButton = new Button('backToMainMenu', () => this.showMainMenu());
        this.addMaterialButton = new Button('addMaterial', () => this.showAddMaterialMenu());
        this.cancelMaterialButton = new Button('cancelMaterial', () => this.cancelAddMaterial());
        this.saveMaterialButton = new Button('saveMaterial', () => this.saveNewMaterial());

        this.materialNameInput = document.getElementById('materialName');
        this.materialMassSelect = document.getElementById('materialMass');
        this.materialTypeSelect = document.getElementById('materialType');
        this.materialList = this.controlPanel.materialList;

        // Обновление списка материалов и начальное состояние меню
        this.updateMaterialList();
    }

    showMaterialMenu() {
        this.controlPanel.menu.classList.add('hidden');
        this.menu.classList.remove('hidden');
        this.controlPanel.selectedMaterial = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || { name: 'Plastic', mass: 1 };
    }

    showAddMaterialMenu() {
        this.controlPanel.menu.classList.add('hidden');
        this.addMaterialMenu.classList.remove('hidden');
    }

    cancelAddMaterial() {
        this.addMaterialMenu.classList.add('hidden');
        this.controlPanel.menu.classList.remove('hidden');
    }

    saveNewMaterial() {
        const materialName = this.materialNameInput.value.trim();
        const materialMass = parseFloat(this.materialMassSelect.value);

        if (materialName !== '') {
            const newMaterial = { name: materialName, mass: materialMass };
            this.materialList.push(newMaterial);
            this.updateMaterialList();
            this.controlPanel.selectedMaterial = newMaterial;
        }

        this.showMainMenu();
    }

    updateMaterialList() {
        this.materialTypeSelect.innerHTML = '';
        this.materialList.forEach(material => {
            const option = document.createElement('option');
            option.value = material.name;
            option.textContent = material.name;
            this.materialTypeSelect.appendChild(option);
        });

        if (!this.controlPanel.selectedMaterial && this.materialList.length > 0) {
            this.controlPanel.selectedMaterial = this.materialList[0];
            this.materialTypeSelect.value = this.controlPanel.selectedMaterial.name;
        }
    }

    showMainMenu() {
        this.menu.classList.add('hidden');
        this.addMaterialMenu.classList.add('hidden');
        this.controlPanel.menu.classList.remove('hidden');
    }
}
