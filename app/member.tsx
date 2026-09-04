import { useState } from "react";
import { View } from "react-native";
import { Button, Input } from "panelui-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Type, Choices } from "../components/ui";
import { Confirm } from "../components/confirm";
import { useCare } from "../lib/store";
import { memberSchema, type Member } from "../shared/contracts";
export default function MemberForm() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    { state, act, pending, notify } = useCare();
  const old = state!.members.find((m) => m.id === id);
  const [name, setName] = useState(old?.name ?? "");
  const [age, setAge] = useState(String(old?.age ?? ""));
  const [gender, setGender] = useState<Member["gender"]>(
    old?.gender ?? "Female",
  );
  const [relation, setRelation] = useState<Member["relation"]>(
    old?.relation ?? "Other",
  );
  const [blood, setBlood] = useState(old?.blood ?? "");
  const [allergies, setAllergies] = useState(old?.allergies ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remove, setRemove] = useState(false);
  async function save() {
    const r = memberSchema.safeParse({
      id: old?.id ?? "new",
      name,
      age: age === "" ? NaN : Number(age),
      gender,
      relation,
      blood,
      allergies,
    });
    if (!r.success) {
      setErrors(
        Object.fromEntries(
          r.error.issues.map((i) => [String(i.path[0]), i.message]),
        ),
      );
      return;
    }
    try {
      await act({ type: "member.save", member: r.data });
      notify("Family profile saved");
      router.back();
    } catch {}
  }
  return (
    <Screen back title={old ? "Edit family member" : "Add family member"}>
      <Input
        label="Full name"
        value={name}
        onChangeText={setName}
        errorMessage={errors.name}
        placeholder="Patient name"
      />
      <Input
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        errorMessage={errors.age}
        placeholder="Years"
      />
      <View style={{ gap: 12 }}>
        <Type>Gender</Type>
        <Choices
          values={memberSchema.shape.gender.options}
          value={gender}
          onChange={(v) => setGender(memberSchema.shape.gender.parse(v))}
        />
      </View>
      <View style={{ gap: 12 }}>
        <Type>Relationship</Type>
        <Choices
          values={memberSchema.shape.relation.options}
          value={relation}
          onChange={(v) => setRelation(memberSchema.shape.relation.parse(v))}
        />
      </View>
      <View style={{ gap: 12 }}>
        <Type>Blood group</Type>
        <Choices
          values={["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"]}
          value={blood}
          onChange={setBlood}
        />
      </View>
      <Input
        label="Allergies or care notes"
        value={allergies}
        onChangeText={setAllergies}
        multiline
        placeholder="Optional"
        errorMessage={errors.allergies}
      />
      <Button fullWidth size="lg" loading={pending} onPress={save}>
        Save profile
      </Button>
      {old && (
        <Button variant="ghost" onPress={() => setRemove(true)}>
          Remove family member
        </Button>
      )}
      <Confirm
        open={remove}
        setOpen={setRemove}
        title="Remove family member?"
        detail={name}
        label="Remove"
        loading={pending}
        onConfirm={() =>
          void act({ type: "member.delete", id: old!.id })
            .then(() => {
              setRemove(false);
              router.back();
            })
            .catch(() => {})
        }
      />
    </Screen>
  );
}
