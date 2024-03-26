<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">Signup Lists</b-navbar-brand>      
    </b-navbar>
    <b-overlay :show="show">
      <b-container fluid class="my-4">
        <b-row>
          <b-col xs="12" sm="4">
            <b-card no-body class="mb-3">
              <template #header>
                <div class="d-flex justify-content-between align-items-center">
                  Lists
                  <b-button class="ml-3" size="sm" @click="refreshLists"><b-icon-arrow-clockwise /></b-button>
                </div>
              </template>
              <b-list-group flush>
                <b-list-group-item
                  v-for="list, i in lists"
                  :key="i"
                  class="d-flex justify-content-between align-items-center"
                  :class="{ 'font-weight-bold': selectedList?.id === list.id }"
                >
                  <span @click="selectList(list.id)" :title="list.id">{{ list.name }}</span>
                  <span>
                    <b-badge variant="dark" pill>{{ list.count }}</b-badge>
                    <b-button @click="handleClickDeleteList(list.id)" class="ml-2" size="sm"><b-icon-trash /></b-button>
                  </span>
                </b-list-group-item>
                <b-list-group-item>
                  <b-input-group>
                    <b-form-input v-model="nameOfListToCreate" placeholder="List name" />
                    <b-input-group-append>
                      <b-button @click="handleClickAddList"><b-icon-plus-circle /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
          <b-col xs="12" sm="8">
            <b-card no-body>
              <template #header>
                <div v-if="selectedList != null" class="d-flex justify-content-between align-items-center">
                  {{ selectedList.name }}
                  <b-button class="ml-3" size="sm" @click="refreshSelectedList"><b-icon-arrow-clockwise /></b-button>
                </div>
                <div v-else>
                  No List Selected
                </div>
              </template>
              <b-list-group flush>
                <b-list-group-item
                    v-for="item, i in (selectedList == null ? [] : selectedList.participants)"
                    :key="i"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span :title="item.id">
                      {{ item.name }}
                    </span>
                    <span>
                      <div class="d-flex align-items-center">
                        <b-form-checkbox v-model="item.reviewed" @change="handleClickUpdateParticipant(item.id, item.reviewed)" ></b-form-checkbox>
                        <b-button @click="handleClickDeleteListParticipant(item.id)" size="sm"><b-icon-trash /></b-button>
                      </div>
                      </span>
                  </b-list-group-item>

                <b-list-group-item v-if="selectedList != null">
                  <b-input-group>
                    <b-form-input v-model="nameOfParticipantToAdd" placeholder="Name" />
                    <b-input-group-append>
                      <b-button @click="handleClickAddParticipant"><b-icon-plus-circle /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { SignupList, SignupListBasicInfo, Id, getLists, addList, getList, 
  updateParticipantOnList, addParticipantToList, deleteList, deleteParticipantOnList } from './../data'

const lists: Ref<SignupListBasicInfo[]> = ref([])
const nameOfListToCreate = ref("")

const selectedList: Ref<null | SignupList> = ref(null)
const nameOfParticipantToAdd = ref("")
const show = ref(false);

async function refreshLists() {
  show.value = true;
  lists.value = await getLists()
  if (selectedList.value && !lists.value.find(l => l.id === selectedList.value!.id)) {
    selectedList.value = null
  }
  show.value = false;
}
onMounted(refreshLists)

async function selectList(listId: Id) {
  show.value = true;
  selectedList.value = await getList(listId)
  show.value = false;
}

async function handleClickAddList() {
  show.value = true;
  const id = await addList(nameOfListToCreate.value)
  nameOfListToCreate.value = ""
  await refreshLists()
  await selectList(id)
  show.value = false;
}

async function refreshSelectedList() {
  show.value = true;
  if (selectedList.value == null) {
    return
  }
  selectedList.value = await getList(selectedList.value.id)
  show.value = false;
}

async function handleClickAddParticipant() {
  if (selectedList.value == null) {
    return
  }
  show.value = true;
  await addParticipantToList(
    selectedList.value?.id, 
    {
      name: nameOfParticipantToAdd.value,
      reviewed: false
    }
  )
  nameOfParticipantToAdd.value = ""
  await refreshSelectedList()
  await refreshLists()
  show.value = false;
}

async function handleClickDeleteList(listId: Id) {
  show.value = true;
  await deleteList(listId)
  if (listId === selectedList.value?.id) {
    selectedList.value = null    
  }
  await refreshLists()
  show.value = false;
}

async function handleClickDeleteListParticipant(participantId: Id) {
  if (!selectedList.value) {
    return
  }
  show.value = true;
  await deleteParticipantOnList(selectedList.value?.id, participantId)
  await refreshSelectedList()
  show.value = false;
}

async function handleClickUpdateParticipant(participantId: Id, reviewed: boolean) {
  if (!selectedList.value) {
    return
  }
  show.value = true;
  await updateParticipantOnList(selectedList.value?.id, participantId, { name: "", reviewed })
  show.value = false;
}

</script>