"use client";

import { Avatar } from "@/components/Avatar";
import { Radio, RadioGroup } from "@/components/Radio/Radio";
import { Spinner } from "@/components/Spinner";
import { Textarea } from "@/components/Textarea";
import {
  Button,
  Card,
  CheckBox,
  Dropdown,
  Modal,
  Switch,
  TextField,
} from "@/index";
import { useState, type ReactNode } from "react";

function Showcase({
  title,
  description,
  frame = "card",
  children,
}: {
  title: string;
  description?: string;
  /** "bare" für Komponenten, die selbst eine Fläche sind (Card, Panel) —
   *  sonst verschluckt eine umschließende Card deren eigene Tiefenstaffelung. */
  frame?: "card" | "bare";
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>
      {frame === "card" ? (
        <Card>
          <div className="flex flex-wrap items-start gap-4">{children}</div>
        </Card>
      ) : (
        <div className="flex flex-wrap items-start gap-4">{children}</div>
      )}
    </section>
  );
}

const HomePage = () => {
  const [switchOn, setSwitchOn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [check, setCheck] = useState(true);
  const [radio, setRadio] = useState("jakob");

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 p-8">
        {/* <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text">Komponenten-Showcase</h1>
          <p className="text-text-muted">
            Jede Komponente einzeln, ohne Dashboard-Kontext.
          </p>
        </div> */}

        <Showcase title="Textarea">
          <div className="flex gap-4">
            <Textarea label="Dein Kommentar"></Textarea>
            <Spinner />
          </div>
        </Showcase>

        <Showcase title="Avatar">
          <div className="flex gap-4">
            <Avatar name="Jakob Jung"></Avatar>
          </div>
        </Showcase>

        <Showcase title="RadioButton">
          <div>
            <RadioGroup name="x" onChange={setRadio} value={radio}>
              <Radio value="jakob" label="Jakob" />
              <Radio value="laura" label="Laura" />
            </RadioGroup>
          </div>
        </Showcase>

        <Showcase title="Button" description="Varianten, Größen, Zustände">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="text">Text</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Showcase>

        <Showcase title="Card" description="basic vs. panel" frame="bare">
          <Card variant="basic" className="w-56">
            Basic
          </Card>
          <Card variant="panel" className="w-56 p-4">
            Panel (ohne eigenes Padding)
          </Card>
        </Showcase>

        <Showcase title="CheckBox">
          <CheckBox
            label="Erinnerung aktivieren"
            checked={check}
            onChange={() => setCheck(!check)}
          />
        </Showcase>

        {/* <Showcase title="Divider">
          <div className="w-64">
            <Divider />
          </div>
        </Showcase> */}

        <Showcase title="Dropdown">
          <Dropdown
            label="Wähle Option"
            placeholder="Auswählen"
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
              { value: "c", label: "Option C" },
            ]}
          />
        </Showcase>

        {/* <Showcase title="Folder">
          <Folder name="Dokumente">
            <Folder name="Bilder">
              <Folder name="Urlaub" />
            </Folder>
            <Folder name="Rechnungen" />
          </Folder>
        </Showcase> */}

        {/* <Showcase title="Modal" description="Dialog und Bottom-Sheet">
          <Button onClick={() => setModalOpen(true)}>Dialog öffnen</Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Sheet öffnen
          </Button>
        </Showcase> */}

        {/* <Showcase title="Notification">
          <div className="relative h-40 w-full rounded-lg border border-dashed border-border">
            <Notification />
          </div>
        </Showcase> */}

        {/* <Showcase title="Panel" frame="bare">
          <Panel className="w-80">
            <Panel.Header>Kopfzeile</Panel.Header>
            <Panel.Content>
              <div className="p-2">Inhalt</div>
            </Panel.Content>
            <Panel.Footer>Fußzeile</Panel.Footer>
          </Panel>
        </Showcase> */}

        <Showcase title="Switch">
          <Switch
            checked={switchOn}
            onChange={setSwitchOn}
            label="Benachrichtigungen"
          />
        </Showcase>

        {/* <Showcase title="TabView">
          <div className="flex h-48 w-full overflow-hidden rounded-lg border border-border">
            <TabView initialTab="a">
              <TabSidebar>
                <TabButton id="a">Tab A</TabButton>
                <TabButton id="b">Tab B</TabButton>
              </TabSidebar>
              <TabPanel id="a">
                <div className="p-4">Inhalt A</div>
              </TabPanel>
              <TabPanel id="b">
                <div className="p-4">Inhalt B</div>
              </TabPanel>
            </TabView>
          </div>
        </Showcase> */}

        <Showcase title="TextField">
          <TextField label="Name" placeholder="Max Mustermann" />
        </Showcase>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Beispiel-Dialog"
        size="md"
        footer={
          <Button size="sm" onClick={() => setModalOpen(false)}>
            Schließen
          </Button>
        }
      >
        <TextField label="Ordnername" />
      </Modal>

      <Modal
        variant="sheet"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Beispiel-Sheet"
        size="md"
        footer={
          <Button size="sm" onClick={() => setSheetOpen(false)}>
            Schließen
          </Button>
        }
      >
        <p className="text-text-muted">
          Nach unten ziehen oder Escape drücken zum Schließen.
        </p>
      </Modal>
    </div>
  );
};

export default HomePage;
