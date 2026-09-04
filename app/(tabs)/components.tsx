import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Input,
  Item,
  Progress,
  Separator,
  Skeleton,
  Switch,
  Text,
  useToast,
} from 'panelui-native';

/** A labelled block, so each group reads as one thing rather than a run of rows. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text size="sm" weight="medium" muted className="uppercase tracking-wider">
          {title}
        </Text>
        {hint ? (
          <Text size="sm" muted>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function ComponentsScreen() {
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [notify, setNotify] = useState(true);
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 40,
        paddingHorizontal: 16,
        gap: 28,
      }}
    >
      <View className="gap-1">
        <Text size="3xl" weight="bold">
          Components
        </Text>
        <Text muted>
          A dozen of the eighty. None of them names a colour — change the theme
          in Settings and watch every one of them follow.
        </Text>
      </View>

      <Section title="Buttons" hint="Variants, sizes, and a loading state.">
        <View className="gap-2">
          <View className="flex-row gap-2">
            <Button className="flex-1">Primary</Button>
            <Button variant="outline" className="flex-1">
              Outline
            </Button>
          </View>
          <View className="flex-row gap-2">
            <Button variant="ghost" className="flex-1">
              Ghost
            </Button>
            <Button variant="destructive" className="flex-1">
              Delete
            </Button>
          </View>
          {/* `loading` swaps the label for a spinner without the button
              changing width, so the row does not jump as it works. */}
          <Button
            loading={loading}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1400);
            }}
          >
            Save changes
          </Button>
        </View>
      </Section>

      <Section title="Overlays" hint="Both render through the provider's portal.">
        <View className="gap-2">
          <Button variant="outline" onPress={() => setOpen(true)}>
            Open a dialog
          </Button>
          <Button
            variant="outline"
            onPress={() =>
              toast.show({
                variant: 'success',
                label: 'Saved',
                description: 'Your changes are live.',
              })
            }
          >
            Show a toast
          </Button>
        </View>

        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Content>
            <Dialog.Title>Delete this project?</Dialog.Title>
            <Dialog.Description>
              This cannot be undone, and the files go with it.
            </Dialog.Description>
            <Dialog.Footer>
              <Button variant="outline" onPress={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onPress={() => setOpen(false)}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Section>

      <Section title="Form" hint="Labels, descriptions and error states included.">
        <Card>
          <Card.Content className="gap-4 p-4">
            <Input label="Name" placeholder="Ada Lovelace" />
            <Input
              label="Email"
              description="We only use it to sign you in."
              placeholder="ada@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {/* A Checkbox carries its own label, because a tick and its text
                are one target — tapping the words has to toggle it. */}
            <Checkbox
              checked={agreed}
              onCheckedChange={setAgreed}
              label="I agree to the terms"
            />
          </Card.Content>
        </Card>
      </Section>

      <Section title="Rows" hint="Item is the settings-list and the list-row shape.">
        <Card>
          <Item>
            <Item.Media>
              <Avatar fallback="AL" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Ada Lovelace</Item.Title>
              <Item.Description>Owner</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Badge variant="secondary">Admin</Badge>
            </Item.Actions>
          </Item>
          <Separator />
          <Item>
            <Item.Content>
              <Item.Title>Notifications</Item.Title>
              <Item.Description>Push alerts for anything urgent</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Switch
                value={notify}
                onValueChange={setNotify}
                accessibilityLabel="Notifications"
                accessibilityHint="Push alerts for anything urgent"
              />
            </Item.Actions>
          </Item>
        </Card>
      </Section>

      <Section title="Status" hint="Alerts, badges, chips and progress.">
        {/* Alert.Content is the flex-1 wrapper. Without it the text sits in the
            row unconstrained and runs past the padding on the right. */}
        <Alert variant="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Every one of these follows the theme, including this one.
            </Alert.Description>
          </Alert.Content>
        </Alert>
        <View className="flex-row flex-wrap gap-2">
          {['All', 'Open', 'Closed'].map((label) => (
            <Chip key={label} selected={filter === label} onPress={() => setFilter(label)}>
              {label}
            </Chip>
          ))}
        </View>
        <View className="flex-row flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Shipped</Badge>
          <Badge variant="destructive">Failed</Badge>
        </View>
        <Progress value={64} label="Uploading" showValueLabel />
      </Section>

      <Section title="Disclosure" hint="Accordion measures its own content.">
        <Card>
          <Accordion defaultValue="what">
            <Accordion.Item value="what">
              {/* The chevron is a part, not automatic — a trigger without one
                  reads as a line of text rather than a row that opens. */}
              <Accordion.Trigger>
                <Accordion.Title>What is in this template?</Accordion.Title>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text size="sm" muted>
                  Three screens, a native tab bar, and the theme wired up. Nothing
                  you have to keep.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="next">
              <Accordion.Trigger>
                <Accordion.Title>How do I add more?</Accordion.Title>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text size="sm" muted className="font-mono">
                  npx panelui-cli@latest add {'<name>'}
                </Text>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Card>
      </Section>

      <Section title="Loading" hint="Skeletons keep the layout while data arrives.">
        <Card>
          <Card.Content className="gap-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </Card.Content>
        </Card>
      </Section>
    </ScrollView>
  );
}
