<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand>{{ selectedList ? selectedList.name : 'Signup List does not exist' }}</b-navbar-brand>
    </b-navbar>
    
    <b-overlay :show="show">
      <b-container fluid class="my-4">
        <b-row>
          <b-col xs="12">
            <b-card no-body>
              <template #header>
                <div v-if="selectedList" class="d-flex justify-content-between align-items-center">
                  {{ 'Participants' }}
                </div>
                <div v-else>
                  Loading List...
                </div>
              </template>
              <b-list-group flush>
                <b-list-group-item
                    v-for="(item, i) in (selectedList ? selectedList.participants : [])"
                    :key="i"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span :title="item.id">
                      {{ item.name }}
                    </span>
                    <span>
                      <div class="d-flex align-items-center">
                        <b-form-checkbox :checked="item.reviewed" disabled></b-form-checkbox>
                        <!-- <b-button v-if="addedParticipants.includes(item.id)" @click="handleClickDeleteListParticipant(item.id)" size="sm"><b-icon-trash /></b-button> -->
                        <b-button 
                          v-if="canDeleteParticipant(item.id)"
                          @click="handleClickDeleteListParticipant(item.id)" 
                          size="sm"
                        >
                          <b-icon-trash />
                        </b-button>
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
import { onMounted, ref } from 'vue'
import { SignupList, Id, getList, 
  addParticipantToList, deleteParticipantOnList } from './../data'


const props = defineProps<{
  listId: string;
}>();

const show = ref(false);

const addedParticipants = ref<Id[]>([]);
const selectedList = ref<SignupList | null>(null);
const canDeleteParticipant = (participantId: string) => addedParticipants.value.includes(participantId);

onMounted(async () => {
  try {
    selectedList.value = await getList(props.listId as Id);
    if (!selectedList.value || !selectedList.value.participants) {
      selectedList.value = null;
    }
  } catch (error) {
    console.error("Error fetching list:", error);
    selectedList.value = null;
  }
});

const nameOfParticipantToAdd = ref("")

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
  const newParticipantId = await addParticipantToList(selectedList.value.id, {
    name: nameOfParticipantToAdd.value,
    reviewed: false
  });

  if (newParticipantId) {
    addedParticipants.value.push(newParticipantId);
    nameOfParticipantToAdd.value = "";
    await refreshSelectedList();
  }
  show.value = false;
}


async function handleClickDeleteListParticipant(participantId: Id) {
  if (!selectedList.value || !addedParticipants.value.includes(participantId)) {
    return
  }
  show.value = true;
  await deleteParticipantOnList(selectedList.value?.id, participantId)
  const index = addedParticipants.value.indexOf(participantId);
  if (index > -1) {
    addedParticipants.value.splice(index, 1);
  }
  await refreshSelectedList()
  show.value = false;
}

</script>
