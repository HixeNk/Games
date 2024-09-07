// Класс панелей materialMenu и addMaterialMenu
class MaterialMenu {
    constructor(controlPanel) {
        this.controlPanel = controlPanel;
        this.menu = document.getElementById('materialMenu');
        this.addMaterialMenu = document.getElementById('addMaterialMenu');
        
        this.chooseMaterialButton = new Button('material', () => this.showMaterialMenu());
        this.backButton = new Button('backToMainMenu', () => this.showMainMenu());
        this.addMaterialButton = new Button('addMaterial', () => this.showAddMaterialMenu());
        this.cancelMaterialButton = new Button('cancelMaterial', () => this.cancelAddMaterial());
        this.saveMaterialButton = new Button('saveMaterial', () => this.saveNewMaterial());

        this.materialNameInput = document.getElementById('materialName');
        this.materialMassSelect = document.getElementById('materialMass');
        this.materialTypeSelect = document.getElementById('materialType');
        this.materialList = this.controlPanel.materialList;

        this.updateMaterialList();
        this.controlPanel.setupDraggableElement(this.addMaterialMenu);
      
    }

    // Кнопка открытия списка материалов
    showMaterialMenu() {
        this.controlPanel.mainMenu.menu.classList.add('hidden');
        this.menu.classList.remove('hidden');
        this.controlPanel.selectedMaterial = this.materialList.find(mat => mat.name === this.materialTypeSelect.value) || { name: 'Plastic', mass: 1 };
    }
    
    // Кнопка открытия панели создания новых материалов
    showAddMaterialMenu() {
        this.controlPanel.mainMenu.menu.classList.add('hidden');
        this.addMaterialMenu.classList.remove('hidden');
    }

    // Кнопка закрытия панели создания материалов
    cancelAddMaterial() {
        this.addMaterialMenu.classList.add('hidden');
        this.controlPanel.mainMenu.menu.classList.remove('hidden');
    }

    // Кнопка сохранения нового материала
    saveNewMaterial() {
        const materialName = this.materialNameInput ? this.materialNameInput.value.trim() : '';
        const materialMass = this.materialMassSelect ? parseFloat(this.materialMassSelect.value) : NaN;
        const newMaterial = { name: materialName, mass: materialMass };
        this.materialList.push(newMaterial);
        this.updateMaterialList();
        this.controlPanel.selectedMaterial = newMaterial;
        this.showMainMenu();
    }

    // Обновление списка материалов
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

    // Отображение gameMenu после закрытия materialMenu или addMaterialMenu
    showMainMenu() {
        this.menu.classList.add('hidden');
        this.addMaterialMenu.classList.add('hidden');
        this.controlPanel.mainMenu.menu.classList.remove('hidden');
    }
}
